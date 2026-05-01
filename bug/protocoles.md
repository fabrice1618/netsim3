# Non-conformités protocolaires — netsim3

Analyse des écarts entre l'implémentation du simulateur et les RFC de référence.
Deux catégories sont distinguées :
- **Bug** : comportement incorrect même dans un contexte de simulation pédagogique
- **Simplification** : choix délibéré pour la pédagogie, documenté ici pour information

---

## IP / Couche réseau

### [Bug] Décrémentation TTL absente sur les paquets routés

**Fichier** : `js/TrafficManager.js`  
**Fonctions** : `proccessTCP` (ligne 155), `proccessICMP` (ligne 255)  
**RFC** : 791

`message.decreaseTTL()` n'est appelé que lorsque `forme = true`, c'est-à-dire uniquement si le paquet est destiné au nœud courant. Les paquets qui transitent par un routeur (routés vers un autre hôte) ne subissent jamais de décrémentation TTL.

```js
// Ligne 153-155 — condition incorrecte
if (forme) {
    message.decreaseTTL();   // jamais appelé pour les paquets en transit
```

**Impact** : les paquets peuvent circuler indéfiniment ; la fonctionnalité traceroute est cassée car le TTL ne diminue jamais à chaque saut.

---

### [Bug] Logique OR incorrecte dans la recherche de chemin

**Fichier** : `js/Network.js`  
**Fonction** : `countUntilDestination` (ligne 183)  
**RFC** : 1122

La fonction utilise `compatibleIP(dstIP) || compatibleMAC(dstMAC)` pour détecter le nœud de destination. Un nœud peut donc être sélectionné par coïncidence de MAC même si son adresse IP est différente.

```js
// Ligne 183
if (c.compatibleIP(dstIP, false) || c.compatibleMAC(dstMAC, false))
```

**Impact** : le routage peut sélectionner un mauvais nœud de destination dans des topologies complexes.

---

### [Simplification] Broadcasts non bloqués aux frontières de routeur

**Fichier** : `js/TrafficManager.js`  
**Fonction** : `sendMessage` (lignes 70–79)  
**RFC** : 919

En mode `!limitbroadcast`, les paquets broadcast sont retransmis sur tous les ports sauf l'ingress, sans vérifier si le dispositif est un routeur. Un routeur conforme RFC 919 doit bloquer les broadcasts IP dirigés par défaut.

```js
// Lignes 70-79
if (!limitbroadcast && connectable.compatibleBroadcastMAC(message.getDestinationMAC())) {
    for (var i = 0; i < connectable.getConnectorNumber(); i++) {
        var c = connectable.getConnector(i);
        if (c !== connector) { c.send(message); }  // pas de vérification routeur/switch
    }
}
```

**Impact** : les broadcasts DHCP peuvent traverser un routeur dans certaines configurations.

---

## ARP

### [Simplification] Résolution ARP cross-sous-réseau possible

**Fichier** : `js/Connectable.js`  
**Fonction** : `findMACforIP` (lignes 149–179)  
**RFC** : 826

La vérification de sous-réseau en ligne 164 porte sur le connecteur intermédiaire (`nextip.sameNetwork(ip)`), pas sur l'interface de l'hôte demandeur. Dans certaines topologies, une entrée ARP peut être enregistrée pour une IP d'un autre sous-réseau.

```js
// Ligne 164
if ((nextip === null) || nextip.sameNetwork(ip)) {
    result = c.whoHas(ip);
    if (result !== null) {
        ARPtable[ip] = result;   // pas de validation que l'IP est bien locale
```

**Impact** : pollution de la table ARP ; comportement incorrect en présence de plusieurs sous-réseaux.

---

## DHCP

### [Simplification] Cycle DISCOVER → OFFER → REQUEST → ACK absent

**Fichiers** : `js/DHCPClient.js` (ligne 48), `js/DHCPServer.js` (ligne 167)  
**RFC** : 2131

Le client envoie directement un message de type `"request"` sans passer par la phase DISCOVER. Le serveur répond avec un message labellisé `"offer"` sans jamais envoyer ACK ni NACK. Le cycle standard RFC 2131 est :

```
Client → DHCPDISCOVER (broadcast)
Serveur → DHCPOFFER
Client → DHCPREQUEST
Serveur → DHCPACK
```

**Implémentation actuelle** :

```js
// DHCPClient.js ligne 48
data.type = "request";      // devrait être "discover" en premier

// DHCPServer.js ligne 167
if (message.getData().type === "request")   // pas de traitement de "discover"

// DHCPServer.js ligne 187
data.description = "DHCP: offer";   // étiquette d'offer sans ACK final
```

**Impact** : pédagogiquement incomplet ; les étudiants ne voient pas les 4 étapes du protocole.

---

### [Simplification] Transport TCP utilisé à la place d'UDP

**Fichiers** : `js/DHCPClient.js` (ligne 51), `js/DHCPServer.js` (ligne 189)  
**RFC** : 2131 (DHCP utilise UDP ports 67/68)

```js
// DHCPClient.js ligne 51
var message = new Message("tcp", ...);  // devrait être "udp"
```

**Impact** : nommage trompeur, sans conséquence fonctionnelle dans le simulateur (un seul type de transport simulé).

---

### [Simplification] IP source non nulle pour la requête initiale

**Fichier** : `js/DHCPClient.js` (ligne 52)  
**RFC** : 2131 §4.4.1

Avant d'obtenir une IP, le client DHCP doit utiliser `0.0.0.0` comme IP source. Le simulateur envoie l'IP actuelle de l'interface (qui peut être `null`).

```js
// Ligne 52
owner.getConnectable().getIPInfo(ifacepos).getIPv4(),  // devrait être "0.0.0.0"
"255.255.255.255",
```

---

## DNS

### [Simplification] Transport TCP utilisé à la place d'UDP

**Fichiers** : `js/DNSClient.js` (ligne 94), `js/DNSServer.js` (lignes 151, 202, 246, 280)  
**RFC** : 1035 (DNS utilise UDP port 53 pour les requêtes standard)

```js
// DNSClient.js ligne 94
var message = new Message("tcp", ...);  // devrait être "udp"
```

**Impact** : nommage trompeur, sans conséquence fonctionnelle dans le simulateur.

---

### [Simplification] Format de message DNS simplifié

**Fichiers** : `js/DNSClient.js` (lignes 89–102), `js/DNSServer.js` (lignes 177–196)  
**RFC** : 1035 §4

Les messages DNS RFC 1035 comportent un en-tête binaire avec ID, flags (QR, AA, RD, RA, RCODE), et des sections question/réponse/autorité/additionnel. Le simulateur utilise un objet JS simple :

```js
// DNSClient.js ligne 89-92
data.domain = domain;
data.type = "lookup";
data.description = "Lookup: " + domain;
```

**Impact** : pas d'interopérabilité avec de vrais clients DNS, acceptable pour une simulation pédagogique.

---

### [Simplification] Pas de code NXDOMAIN dans la réponse négative

**Fichier** : `js/DNSServer.js`  
**Fonction** : `proccessLookup` (lignes 193–195)  
**RFC** : 1035 §4.1.1

Quand un domaine n'existe pas et qu'aucun forwarder n'est configuré, le serveur répond avec `data.ip = null` mais n'inclut pas de RCODE 3 (NXDOMAIN) dans un en-tête.

```js
// Lignes 193-195
data.ip = null;
data.description = "Response: not found";
send = true;
```

---

## HTTP

### [Simplification] Format de requête HTTP simplifié

**Fichier** : `js/HTTPClient.js`  
**Fonction** : `performHTTPRequest` (lignes 172–186)  
**RFC** : 2616 / 7230

Une vraie requête HTTP/1.1 `GET` comprend Request-Line, en-têtes (Host, User-Agent, Connection, Accept) et CRLF. Le simulateur envoie un objet JS :

```js
// Lignes 172-176
data.domain = domain;
data.filename = filename;
data.ip = ip;
data.description = "GET: " + filename;
```

**Impact** : pas d'interopérabilité avec de vrais serveurs HTTP, acceptable pour une simulation pédagogique.

---

### [Simplification] Format de réponse HTTP simplifié

**Fichier** : `js/HTTPServer.js`  
**Fonction** : `receiveMessage` (lignes 415–418)  
**RFC** : 2616 §6

Une vraie réponse HTTP comprend Status-Line (`HTTP/1.1 200 OK\r\n`), en-têtes (Content-Type, Content-Length, Date, Server) et corps. Le simulateur renvoie :

```js
// Lignes 415-418
responsedata.code = code;
responsedata.contents = contents;
responsedata.description = code + "-" + filename;
```

**Impact** : pas d'interopérabilité avec de vrais clients HTTP, acceptable pour une simulation pédagogique.

---

### [Simplification] Sélection du premier domaine pour accès par IP

**Fichier** : `js/HTTPServer.js`  
**Fonction** : `receiveMessage` (lignes 394–407)  
**RFC** : 2616 §14.23 (en-tête Host)

Quand un client accède au serveur par son IP (sans domaine), le simulateur sélectionne arbitrairement le premier domaine configuré :

```js
// Lignes 397-401
var domainKeys = Object.keys(domains);
if ((domainKeys.length > 0) && (filename in domains[domainKeys[0]])) {
    code = 200;
    contents = domains[domainKeys[0]][filename];
```

En HTTP/1.1, le serveur devrait utiliser l'en-tête `Host` pour résoudre le virtual host. Ici l'ordre d'itération de l'objet JS détermine le résultat.

---

## NAT

### [Bug] Asymétrie dans le suivi des flux NAT

**Fichier** : `js/TrafficManager.js`  
**Fonction** : `proccessTCP` (lignes 164–226)  
**RFC** : 3022

Pour les flux dynamiques (lignes 192–226), une entrée de retour est créée dans `NATtable` (ligne 215). Mais pour les ports statiques (entrée existante, lignes 167–191), la suppression de l'entrée après usage (ligne 187–190) peut empêcher la réponse de revenir si le client renvoie un second paquet.

```js
// Ligne 187-190
if (!NATtable[dstport].fixed) {
    delete NATtable[dstport];   // suppression immédiate après le 1er paquet
}
```

De plus, la vérification `originIface` (ligne 167) utilise la position du connecteur entrant, ce qui peut échouer si le flux retour arrive sur un connecteur différent de celui attendu.

**Impact** : les connexions TCP multi-paquets via NAT peuvent être interrompues après le premier échange.

---

## Récapitulatif

| Sévérité | Protocole | Description | Fichier | Ligne |
|---|---|---|---|---|
| Bug | IP/ICMP | TTL non décrémenté en transit | TrafficManager.js | 155, 255 |
| Bug | IP | Logique OR dans `countUntilDestination` | Network.js | 183 |
| Bug | NAT | Asymétrie de suivi des flux | TrafficManager.js | 167–226 |
| Bug | ARP | Résolution possible cross-subnet | Connectable.js | 164–170 |
| Simplification | IP | Broadcasts non bloqués aux routeurs | TrafficManager.js | 70–79 |
| Simplification | DHCP | Cycle 4 étapes absent | DHCPClient.js / DHCPServer.js | 48 / 167 |
| Simplification | DHCP | UDP simulé comme TCP | DHCPClient.js | 51 |
| Simplification | DHCP | IP source non nulle avant attribution | DHCPClient.js | 52 |
| Simplification | DNS | UDP simulé comme TCP | DNSClient.js / DNSServer.js | 94 / 151+ |
| Simplification | DNS | Format de message simplifié | DNSClient.js | 89–102 |
| Simplification | DNS | Pas de RCODE NXDOMAIN | DNSServer.js | 193–195 |
| Simplification | HTTP | Format de requête simplifié | HTTPClient.js | 172–176 |
| Simplification | HTTP | Format de réponse simplifié | HTTPServer.js | 415–418 |
| Simplification | HTTP | Sélection arbitraire du domaine par IP | HTTPServer.js | 397–401 |
