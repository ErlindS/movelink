# Wichtige Terminal-Befehle für MoveLink (React Native / Expo)

Diese Datei dokumentiert die wichtigsten Befehle, die wir genutzt haben, um Fehler mit dem Gradle-Cache zu beheben und die eigenständige Android App (.apk) zu generieren.

## 1. Normaler Entwicklungs-Modus (Schnell)
Wenn die App (oder der Dev Client) bereits auf deinem Handy installiert ist, brauchst du nicht mehr den kompletten nativen Code neu zu kompilieren. Du startest einfach nur den lokalen Server, der sich per WLAN mit deinem Handy verbindet.

```powershell
npx expo start
```

## 2. Kompletten Cache leeren und App neu kompilieren (Fehlerbehebung)
Wenn du jemals wieder seltsame Fehler wie `unsupported class file` oder `class not found in jar` beim Android-Build siehst, bedeutet das meistens, dass der Gradle-Cache beschädigt ist. 
Diese drei Schritte reinigen alles und bauen den nativen Ordner frisch auf:

```powershell
# 1. Stoppt laufende Hintergrundprozesse (Daemons) von Gradle
cd app/android
.\gradlew --stop

# 2. Löscht den kompletten beschädigten Gradle-Cache (Windows PowerShell)
Remove-Item -Recurse -Force "$env:USERPROFILE\.gradle\caches"

# 3. Zwingt Expo dazu, den gesamten /android Ordner sauber neu zu generieren
cd ..
npx expo prebuild --clean
```

## 3. Eine fertige, eigenständige Android App (APK) bauen
Um eine APK zu bauen, die du unabhängig vom PC auf dem Handy nutzen kannst, nutzt du den `assembleRelease` Befehl.

**Wichtig:** Falls du auf deinem PC mehrere Java-Versionen installiert hast (z.B. Java 25), musst du Gradle zwingen, das kompatible **Java 17** aus deinem Android Studio zu verwenden, bevor du den Befehl ausführst.

```powershell
# Zuerst in den App-Ordner wechseln
cd app

# Java-Pfad temporär setzen, in den android-Ordner wechseln und den Release-Build starten
$env:JAVA_HOME="C:\Program Files\Android\Android Studio\jbr"; cd android; .\gradlew assembleRelease
```

*Nach erfolgreichem Durchlauf findest du die fertige APK hier:*
`app/android/app/build/outputs/apk/release/app-release.apk`
