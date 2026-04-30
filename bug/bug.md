# Rapport de bugs — Gestion TCP/IP

Date : 2026-04-29

## Bug 1 — `removeConnector()` : `slice()` au lieu de `splice()`

**Fichier :** `js/Connectable.js:240`  
**Sévérité :** Critique

```js
// Code actuel (bugué)
this.removeConnector = function(pos) {
    connectors.slice(pos, 1);   // slice() retourne un nouveau tableau, ne modifie pas connectors
};

// Correction
this.removeConnector = function(pos) {
    connectors.splice(pos, 1);
};
```

`Array.slice()` ne modifie pas le tableau source. Le connecteur n'est jamais supprimé. Conséquence : quand on retire un port d'un routeur, le connecteur reste actif en mémoire et continue de recevoir/transmettre des paquets.

---

## Bug 2 — `newLease()` : boucle infinie si le pool DHCP est épuisé

**Fichier :** `js/DHCPServer.js:125-139`  
**Sévérité :** Critique

```js
// Code actuel (bugué)
function newLease(mac) {
    var result = initial;   // ex. "100"
    var free = false;
    while (!free) {
        if (result in leases) {
            result++;        // incrémente sans jamais vérifier si result > end
        } else {
            free = true;
        }
    }
    // ...
}

// Correction
function newLease(mac) {
    var result = initial;
    var free = false;
    while (!free) {
        if (result in leases) {
            result++;
            if (result > parseInt(end)) {
                return null;   // pool épuisé
            }
        } else {
            free = true;
        }
    }
    // ...
}
```

Si toutes les adresses IP entre `initial` et `end` sont attribuées, `result` s'incrémente à l'infini et le navigateur freeze. Il manque un test de dépassement de la borne supérieure `end`.

---

## Bug 3 — `ipIntToString()` : variable globale accidentelle

**Fichier :** `js/IPInfo.js:67`  
**Sévérité :** Mineure

```js
// Code actuel (bugué)
function ipIntToString(ip) {
    result = null;   // pas de "var" : variable globale implicite

// Correction
function ipIntToString(ip) {
    var result = null;
```

`result` est déclarée sans `var`, ce qui en fait une variable globale. Pas de crash visible en mode single-thread, mais la variable peut être écrasée par d'autres parties du code et rend le débogage difficile.

---

## Vérifications sans bug confirmé

| Soupçon initial | Conclusion |
|---|---|
| Conversion IP 32-bit signée | Pas de bug : `& 0xFF` normalise correctement chaque octet |
| Ports dynamiques DHCP/HTTP | Pas de bug : le client s'enregistre via `registerApplication` sur son propre port source |
| Suppression d'entrée NAT trop tôt | Intentionnel : l'entrée est supprimée après forwarding de la réponse |
| `getExistingLease()` avec `indexOf` sur tableau sparse | Fonctionne : les deux tableaux partagent la même référence objet |
