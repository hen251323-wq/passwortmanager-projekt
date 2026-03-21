# Passwortmanager Projekt

Der Passwortmanager speichert Nutzernamen / E-Mails und Kennwörter für jedes Nutzerkonto. 
Jedes Nutzerkonto ist einem bestimmtem Set zugeordnet, welches über ein Masterkennwort verschlüsselt ist.
Um ein Set zu entschlüsseln, muss daher erst das Masterkennwort angegeben werden.

---

## Struktur

**Hauptseite**:

Beinhaltet links:

- Button für "*Neues Set*".
- Button für "*Set laden*".
- Button für "*Set speichern*".

Beinhaltet rechts:

- Eingabe für Masterkennwort
- Liste an Nutzerkonten in Set
- Button für "*Nutzerkonto hinzufügen*"

Jedes Nutzerkonto Element beinhaltet:

- Nutzernamen Anzeige
- Kennwort Anzeige
- Button für "*Löschen*"
- Button für "*Editieren*"

---

## Daten

Gespeichert werden nur die Sets seperat und verschlüsselt. Wie bereits erwähnt können diese von der **Hauptseite** erstellt, geladen oder gespeichert werden.
Jedes Set speichert jeweilige Nutzerkonten. Jedes Nutzerkonto speichert dessen Nutzername und Kennwort.

Zu den möglichen Änderungen an den Sets gehören:

- Konten hinzufügen
- Konten entfernen
- Nutzername ändern
- Kennwort ändern

Die geladenen Konten im Set werden vertikal auf der Seite augelistet und sind demnach interaktiv.
