<div align="right">

M426 - Software mit agilen Methoden entwickeln  
Gewerblich-industrielles Bildungszentrum Zug  
Claudio Hübscher / Remo Flury

</div>

# Projektauftrag

## Inhaltsverzeichnis

Ausgangslage.................................................................................................... 1  
Ziel....................................................................................................................... 2  
Rahmenbedingungen........................................................................................ 2  
Bewertungskriterien.......................................................................................... 3  
Benotung............................................................................................................ 4

## Ausgangslage

Der STV Ennetbürgen organisiert jedes Jahr einen Lottomatch. Teil dieses Lottomatches ist die sogenannte Gratis-Verlosung, wo jede/r TeilnehmerIn mittels Adressangabe an dieser kostenlosen Verlosung teilnehmen kann. Die Adressen werden auf Zetteln notiert, die wiederum in einer Tüte gesammelt werden, woraus schlussendlich die Gewinner gezogen werden. Die Sammlung der Adressen dient dem Verein zu Marketing-Zwecken, um bei den Gästen im nächsten Jahr per Briefpost Werbung für den nächsten Lottomatch zuzustellen.

Der Lottomatch verfügt über viele Stammgäste. Über 80% der Gäste nahmen bereits im Vorjahr am Lottomatch und somit auch an der Gratis-Verlosung teil.

Aus diesem Grund wurde ein Teil dieses Prozesses digitalisiert:

- Die Adressen werden in einer Excel-Tabelle gespeichert
- Jede einzigartige Adresse verfügt über eine ID
- Bekannte Gäste erhalten als Teil der Werbung einen vorgefertigten Zettel mit deren Adresse und der ID, sodass diese direkt diesen Zettel zum Lottomatch mitnehmen müssen - ohne einen Neuen ausfüllen zu müssen
- Neue Gäste erhalten einen leeren Zettel zum Ausfüllen ihrer Adressangaben
- Die gesammelten Zettel werden während dem Lottomatch eingesammelt und während dem Lottomatch mit der Excel-Tabelle abgeglichen:
  - Bekannte Gäste werden in der Tabelle markiert, dass diese im jeweiligen Jahr teilgenommen haben (mittels ID auf dem Zettel)
  - Neue Gäste werden der Tabelle hinzugefügt und ebenfalls markiert, dass diese im jeweiligen Jahr teilgenommen haben
  - Gäste, welche länger als drei Jahre nicht mehr teilgenommen haben, werden aus der Tabelle gelöscht

Trotz der teilweisen Digitalisierung ist dieser Prozess nach wie vor mühsam und vor allem zeitaufwendig, da gerade der Abgleich mit der Tabelle komplett manuell vorgenommen werden muss und die ID den Prozess nur unbefriedigt gut vereinfacht/beschleunigt.

## Ziel

Der Prozess soll mit einer neuen Applikation soweit digitalisiert werden, wie nur möglich. Dabei soll nicht nur an die Vereinfachung der Address-Verwaltung, sondern von der Erfassung der Adressen durch Gäste bis zur Auslosung gedacht werden.  
Die Gäste weisen ein breites Alters-Spektrum auf, wobei aber die Mehrheit älter als 40 Jahre alt ist - dies sollte bei der Planung und Umsetzung nicht ausser Acht gelassen werden.

## Rahmenbedingungen

Folgende Rahmenbedingungen gibt der Auftraggeber strikt vor:

- Das Marketing soll auch weiterhin per Briefpost stattfinden. Ein zukünftiger Umstieg auf E-Mails ist in Betracht zu ziehen.
- Das Ausfüllen des Formulars für neue Gäste soll so einfach und schnell wie möglich sein
- Das Abgeben der Zettel soll so einfach und schnell wie möglich sein
- Das Eintragen neuer Adressen soll für Mitglieder so einfach und schnell wie möglich sein
- Das ‘Einchecken’ bekannter Gäste soll so einfach und schnell wie möglich sein
- Der Lottomatch findet an zwei Tagen statt, es gibt Gäste, welche an beiden Tagen teilnehmen
- Am Lottomatch steht ein Laptop zur Verfügung
- Die meisten Gäste verfügen über ein Smartphone
- Jedes Mitglied des STV Ennetbürgen verfügt über ein Smartphone
- Der Kunde verfügt über keine Informatik-Kenntnisse und möchte das Produkt sofort produktiv einsetzen
- Die Applikation soll unabhängig vom Betriebssystem funktionieren
- Mobile-fähigkeit ist keine Bedingung, aber wünschenswert

## Bewertungskriterien

### Projektauftrag (2P)

Aus dem Projektauftrag wird eine Applikation entworfen, welche sich innerhalb der Rahmenbedingungen befindet und das Ziel erfüllt oder gar visionär übertrifft.  
Es werden Anforderungen definiert, passende Technologien/Frameworks/Tools gefunden und erwartete Schwierigkeiten prognostiziert. (2P)

### Vorgehen nach Scrum (2P)

Scrumrollen sind definiert, zugewiesen und werden wahrgenommen (1P), Team organisiert sich selbst (1P).

### Scrum Events werden durchgeführt (8P)

Sprint Planning (2P), Daily Scrum (2P), Sprint Review (2P), Sprint Retrospektive (2P).

### Scrum Artefakte werden erstellt (5P)

Product Backlog (1P), Sprint Backlog (1P), Scrum Board (1P), User Stories (1P), Inkrement (1P).

### Dokumentation (2P)

Dokumentation beschreibt auf 1-2 Seiten das Projekt in Bezug auf das Ziel, die Erarbeitung sowie das Resultat (1P). Diagramme oder Grafiken unterstützen das Beschriebene (1P).

### Source Code (3P)

Source Code ist gemäss Prinzipien von Clean Code umgesetzt (1P), enthält sinnvolle Fehlerbehandlung (1P) und ist in einer logischen Struktur aufgebaut (1P).

### CI/CD (2P)

Automatisch CI/CD Pipeline wird bei jedem Commit auf sämtliche Branches getriggert (1P). Applikation wird anhand eines Release-Branches (z.B. main) entweder automatisch auf einen Webserver deployed oder Dateien werden zu einem Release-Bundle/Installer zusammengestellt (1P).

### Tests (2P)

Mindestens Unit Tests mit einer qualitativ und quantitativ wertigen Abdeckung (>75%) werden zum produktiven Code umgesetzt (1P).  
Tests werden automatisch bei jeder Ausführung der CI/CD-Pipeline ausgeführt, der Build schlägt fehl, wenn mind. 1 Test fehlschlägt (1P).

### Schlusspräsentation (4P)

Schlusspräsentation setzt relevante Aspekte in Bezug auf Projektidee (1P), technische Umsetzung (1P), methodische Umsetzung gemäss Scrum (1P) sowie dem Resultat (1P).

### Einhaltung der Rahmenbedingungen (2P)

Die Applikation hält sich an die Rahmenbedingungen. (2P)

### Projekterfüllungsgrad (4P)

Lösung funktioniert einwandfrei auf Webserver oder mind. einer lokalen Instanz (1P), sämtliche Anforderungen gemäss Projektauftrag sind erfüllt (3P).

### Ranking innerhalb der Klasse (2P)

Prozentualer Anteil aller erhaltenen gegenüber möglichen Stimmen innerhalb der Klasse. Jede/r SchülerIn verfügt über eine Stimme. (2P)

## Benotung

| | |
|---|---:|
| Total mögliche Punkte: | 38 Punkte |
| Notwendige Punkte für Note 6.0: | 36 Punkte |
| Maximaler Übertrag der Note: | 0.5 Noten |
