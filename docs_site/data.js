const DOCS_DATA = {
  "files": [
    {
      "path": "embedded/architecture.md",
      "title": "MoveLink Embedded Firmware - Container-Architektur",
      "content": "<!--\nC4-Ebene: Container\nDeployable: Ja\n-->\n\n# MoveLink Embedded Firmware - Container-Architektur\n# FA2\n\nDieses Dokument beschreibt die Embedded Sensor-Firmware als eigenständige, deploybare Einheit im C4-Modell.\n\n## C4-Architektur-Ebene\n* **C4-Ebene:** Container\n* **Deployable:** Ja\n* **Deployment-Artefakt:** Binär-Firmware (flashed via USB/Serial)\n* **Technologie-Stack:** Arduino C/C++, LSM6DS3 IMU Library, Edge Impulse SDK, Bluetooth Low Energy\n\n## Beschreibung\nDie Sensor-Firmware läuft auf dem XIAO nRF52840 Sense Controller. Sie erfasst Beschleunigungs- und Rotationsdaten über den integrierten LSM6DS3-Sensor mit einer festen Abtastrate (50Hz), wendet Signalfilterungen zur Rauschunterdrückung an und streamt die Datenpakete als binäres Array via BLE Characteristics an die Mobile App. Alternativ führt sie Edge-Impulse-Inferenzmodelle direkt auf dem Mikrocontroller aus, um Trainingsübungen (z.B. Bizeps-Curls, Schulterdrücken und Seitheben) lokal zu klassifizieren und Fehler über die integrierten RGB-LEDs anzuzeigen.\n\n## Requirements\n\n**FA2.1**: Das Gerät sammelt die Dreh- und Beschleunigungsdaten des Trainierenden.\n**FA2.2**: Das Gerät erkennt, was für eine Bewegung ausgeührt worden ist. \n**FA2.3**: Das Gerät bewertet die Ausführung der Bewegung. \n**FA2.4**: Das Gerät gibt durch die LED den Verbindungsstatus aus.\n**FA2.5**: Das Gerät versendet die Daten an die App.\n**FA2.6**: Das Gerät ist in einem Gehäuse.\n\n## Komponenten in diesem Container\nDie Sensor-Firmware besteht aus folgenden logischen Komponenten:\n**FA2.1** -> **[Sensordatenerfassung (Loop)](file:///home/arch/repo/movelink/embedded/src/components/sensordatenerfassung/architecture.md)**: Liest kontinuierlich Beschleunigung (X, Y, Z) und Gyroskop (X, Y, Z).\n**FA2.2, FA2.3** -> **[Inferenz-Engine (Edge Impulse)](file:///home/arch/repo/movelink/embedded/src/components/inferenz_engine/architecture.md)**: Klassifiziert Übungsausführungen lokal auf dem Chip.\n**FA2.4** -> **[LED- & Display-Controller](file:///home/arch/repo/movelink/embedded/src/components/led_display_controller/architecture.md)**: Bietet direktes visuelles Feedback an den Nutzer bei Fehlern über RGB-LEDs.\n**FA2.5** -> **[BLE-Streamer](file:///home/arch/repo/movelink/embedded/src/components/ble_streamer/architecture.md)**: Überträgt die erfassten Daten an den App-Container.\n**FA2.6** -> **[Gehäuse](file:///home/arch/repo/movelink/embedded/src/components/gehause/architecture.md)**: Bietet physischen Schutz, sodass das Tragen erleichtert wird.\n\n## Datenfluss\n```mermaid\nflowchart LR\n    %% Stil-Definitionen für Übersichtlichkeit\n    classDef hardware fill:#f5f5f5,stroke:#666,stroke-width:2px;\n    classDef process fill:#d1e8ff,stroke:#0066cc,stroke-width:1px;\n    classDef external fill:#ffe5d9,stroke:#cc3300,stroke-width:1px;\n\n    %% Datenquellen & Hardware\n    IMU[(\"LSM6DS3 Sensor (Hardware)\")]:::hardware\n    LED[/\"RGB-LEDs (Hardware)\"/]:::hardware\n\n    %% Interne Komponenten (Prozesse)\n    Sensation(Sensordatenerfassung):::process\n    Engine(Inferenz-Engine):::process\n    LED_Ctrl(LED- & Display-Controller):::process\n    BLE_Stream(BLE-Streamer):::process\n\n    %% Externe Senke\n    App[[MoveLink Mobile App]]:::external\n\n    %% Datenflussverbindungen mit Datenbeschriftung\n    IMU -->|\"Rohdaten (IMU X,Y,Z @ 50Hz)\"| Sensation\n    Sensation -->|\"Sensor-Daten-Array (Buffer)\"| Engine\n    \n    %% Aufspaltung nach der Inferenz\n    Engine -->|\"Klassifizierung & Bewertung\"| LED_Ctrl\n    Engine -->|\"Klassifizierung & Bewertung\"| BLE_Stream\n    \n    %% Ausgaben\n    LED_Ctrl -->|\"Steuersignal (Anzeige)\"| LED\n    BLE_Stream -->|\"Binäres Array / JSON via BLE\"| App\n```\n\n## Abwägungen\n- **Lokale Auswertung vs. Cloud-Streaming**: Das Ausführen der Inferenz-Engine direkt auf dem Xiao-Controller minimiert die Latenz (NF1) und spart Bandbreite bei der Funkübertragung.\n- **Energiebedarf**: Die kontinuierliche Sensordatenerfassung und BLE-Funkübertragung verbrauchen Energie, weshalb die Akkulaufzeit durch einen stromsparenden Betrieb im Idle und Deaktivieren nicht benötigter Hardware-Peripherie optimiert wird.\n",
      "headings": [
        {
          "level": 1,
          "text": "MoveLink Embedded Firmware - Container-Architektur",
          "line": 6
        },
        {
          "level": 1,
          "text": "FA2",
          "line": 7
        },
        {
          "level": 2,
          "text": "C4-Architektur-Ebene",
          "line": 11
        },
        {
          "level": 2,
          "text": "Beschreibung",
          "line": 17
        },
        {
          "level": 2,
          "text": "Requirements",
          "line": 20
        },
        {
          "level": 2,
          "text": "Komponenten in diesem Container",
          "line": 29
        },
        {
          "level": 2,
          "text": "Datenfluss",
          "line": 37
        },
        {
          "level": 2,
          "text": "Abwägungen",
          "line": 71
        }
      ],
      "c4_level": "Container",
      "deployable": "Ja"
    },
    {
      "path": "embedded/.pio/libdeps/seeed_xiao_nrf52840_sense/ArduinoBLE/README.md",
      "title": "ArduinoBLE",
      "content": "# ArduinoBLE\n\n[![Compile Examples Status](https://github.com/arduino-libraries/ArduinoBLE/workflows/Compile%20Examples/badge.svg)](https://github.com/arduino-libraries/ArduinoBLE/actions?workflow=Compile+Examples) [![Spell Check Status](https://github.com/arduino-libraries/ArduinoBLE/workflows/Spell%20Check/badge.svg)](https://github.com/arduino-libraries/ArduinoBLE/actions?workflow=Spell+Check)\n\nEnables Bluetooth® Low Energy connectivity on the Arduino MKR WiFi 1010, Arduino UNO WiFi Rev.2, Arduino Nano 33 IoT, Arduino Nano 33 BLE, Arduino Portenta H7, Arduino Giga R1 and Arduino UNO R4 WiFi.\n\nThis library supports creating a Bluetooth® Low Energy peripheral & central mode.\n\nFor the Arduino MKR WiFi 1010, Arduino UNO WiFi Rev.2, and Arduino Nano 33 IoT boards, it requires the NINA module to be running [Arduino NINA-W102 firmware](https://github.com/arduino/nina-fw) v1.2.0 or later.\n\nFor the Arduino UNO R4 WiFi, it requires the ESP32-S3 module to be running [firmware](https://github.com/arduino/uno-r4-wifi-usb-bridge) v0.2.0 or later.\n\n\nFor more information about this library please visit us at:\nhttps://www.arduino.cc/en/Reference/ArduinoBLE\n\n## License\n\n```\nCopyright (c) 2019 Arduino SA. All rights reserved.\n\nThis library is free software; you can redistribute it and/or\nmodify it under the terms of the GNU Lesser General Public\nLicense as published by the Free Software Foundation; either\nversion 2.1 of the License, or (at your option) any later version.\n\nThis library is distributed in the hope that it will be useful,\nbut WITHOUT ANY WARRANTY; without even the implied warranty of\nMERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU\nLesser General Public License for more details.\n\nYou should have received a copy of the GNU Lesser General Public\nLicense along with this library; if not, write to the Free Software\nFoundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA\n```\n",
      "headings": [
        {
          "level": 1,
          "text": "ArduinoBLE",
          "line": 1
        },
        {
          "level": 2,
          "text": "License",
          "line": 17
        }
      ],
      "c4_level": null,
      "deployable": null
    },
    {
      "path": "embedded/.pio/libdeps/seeed_xiao_nrf52840_sense/Seeed Arduino LSM6DS3/README.md",
      "title": "embedded/.pio/libdeps/seeed_xiao_nrf52840_sense/Seeed Arduino LSM6DS3/README.md",
      "content": "Seeed Arduino LSM6DS3  [![Build Status](https://travis-ci.com/Seeed-Studio/Accelerometer_And_Gyroscope_LSM6DS3.svg?branch=master)](https://travis-ci.com/Seeed-Studio/Accelerometer_And_Gyroscope_LSM6DS3)\n---------------------------------\n\n![](https://statics3.seeedstudio.com/images/product/105020012%203.jpg)\n\nMore detail refer to [wiki page](http://wiki.seeedstudio.com/Grove-6-Axis_AccelerometerAndGyroscope/) and [product page](https://www.seeedstudio.com/Grove-6-Axis-Accelerometer%26Gyroscope-p-2606.html)\n\nExample\n------\n\nExample           | Feature\n----------------- | ----------------------------------------------------\nHighLevelExample  | Using class LSM6DS3\nLowLevelExample   | Using class LSM6DS3Core\nPedometer         | A demo for making a pedometer \nFreeFallDetect    | Detect object free falling, like a falling football\n\n\nAPI\n------\n\nMethods in class LSM6DS3   | Methods in class LSM6DS3Core\n-------------------------- | -------------\nreadRawAccelX              | readRegisterRegion   \nreadRawAccelY              | readRegister         \nreadRawAccelZ              | readRegisterInt16  \nreadRawGyroX               | writeRegister       \nreadRawGyroY               | embeddedPage        \nreadRawGyroZ               | *\nreadFloatAccelX            | *\nreadFloatAccelY            | *\nreadFloatAccelZ            | *\nreadFloatGyroX             | *\nreadFloatGyroY             | *\nreadFloatGyroZ             | *\nreadRawTemp                | *\nreadTempC                  | *\nreadTempF                  | *\ncalcGyro                   | *\ncalcAccel                  | *\n\n----\n\n\nLicense Information\n-------------------\n\nThis product is _**open source**_! \n\nPlease review the LICENSE.md file for license information. \n\n\n\n",
      "headings": [],
      "c4_level": null,
      "deployable": null
    },
    {
      "path": "embedded/.pio/libdeps/seeed_xiao_nrf52840_sense/Seeed Arduino LSM6DS3/LICENSE.md",
      "title": "embedded/.pio/libdeps/seeed_xiao_nrf52840_sense/Seeed Arduino LSM6DS3/LICENSE.md",
      "content": "The original open source library is starting from the SparkFun in Nov 2021.\n\nThe licence for that library is MIT.\n\nThe first evolution of the library is recorded here:\n\nhttps://github.com/sparkfun/SparkFun_LSM6DS3_Arduino_Library\n\nvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvStartvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv\n\nSparkFun License Information\n============================\n\nSparkFun uses two different licenses for our files - one for hardware and one for code.\n\nHardware\n---------\n\n**SparkFun hardware is released under [Creative Commons Share-alike 4.0 International](http://creativecommons.org/licenses/by-sa/4.0/).**\n\nNote: This is a human-readable summary of (and not a substitute for) the [license](http://creativecommons.org/licenses/by-sa/4.0/legalcode).\n\nYou are free to:\n\nShare — copy and redistribute the material in any medium or format\nAdapt — remix, transform, and build upon the material\nfor any purpose, even commercially.\nThe licensor cannot revoke these freedoms as long as you follow the license terms.\nUnder the following terms:\n\nAttribution — You must give appropriate credit, provide a link to the license, and indicate if changes were made. You may do so in any reasonable manner, but not in any way that suggests the licensor endorses you or your use.\nShareAlike — If you remix, transform, or build upon the material, you must distribute your contributions under the same license as the original.\nNo additional restrictions — You may not apply legal terms or technological measures that legally restrict others from doing anything the license permits.\nNotices:\n\nYou do not have to comply with the license for elements of the material in the public domain or where your use is permitted by an applicable exception or limitation.\nNo warranties are given. The license may not give you all of the permissions necessary for your intended use. For example, other rights such as publicity, privacy, or moral rights may limit how you use the material.\n\n\nCode\n--------\n\n**SparkFun code, firmware, and software is released under the [MIT License](http://opensource.org/licenses/MIT).**\n\nThe MIT License (MIT)\n\nCopyright (c) 2015 SparkFun Electronics\n\nPermission is hereby granted, free of charge, to any person obtaining a copy\nof this software and associated documentation files (the \"Software\"), to deal\nin the Software without restriction, including without limitation the rights\nto use, copy, modify, merge, publish, distribute, sublicense, and/or sell\ncopies of the Software, and to permit persons to whom the Software is\nfurnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\nFITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\nAUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\nLIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\nOUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE\nSOFTWARE.\n\n--------------\n\nvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvEndvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv\n\n\nContributions from seeed studio are recorded on GitHub:\n\nhttps://github.com/Seeed-Studio/Seeed_Arduino_LSM6DS3\n\nAdd the Tensorflow lite support\n\nvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvStartvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv\n\nMIT License\n\nCopyright (c) 2020 Seeed Studio\n\nPermission is hereby granted, free of charge, to any person obtaining a copy\nof this software and associated documentation files (the \"Software\"), to deal\nin the Software without restriction, including without limitation the rights\nto use, copy, modify, merge, publish, distribute, sublicense, and/or sell\ncopies of the Software, and to permit persons to whom the Software is\nfurnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\nFITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\nAUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\nLIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\nOUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE\nSOFTWARE.\n\nvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvEndvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv\n",
      "headings": [],
      "c4_level": null,
      "deployable": null
    },
    {
      "path": "embedded/.pio/libdeps/xiaoblesense/ArduinoBLE/README.md",
      "title": "ArduinoBLE",
      "content": "# ArduinoBLE\n\n[![Compile Examples Status](https://github.com/arduino-libraries/ArduinoBLE/workflows/Compile%20Examples/badge.svg)](https://github.com/arduino-libraries/ArduinoBLE/actions?workflow=Compile+Examples) [![Spell Check Status](https://github.com/arduino-libraries/ArduinoBLE/workflows/Spell%20Check/badge.svg)](https://github.com/arduino-libraries/ArduinoBLE/actions?workflow=Spell+Check)\n\nEnables Bluetooth® Low Energy connectivity on the Arduino MKR WiFi 1010, Arduino UNO WiFi Rev.2, Arduino Nano 33 IoT, Arduino Nano 33 BLE, Arduino Portenta H7, Arduino Giga R1 and Arduino UNO R4 WiFi.\n\nThis library supports creating a Bluetooth® Low Energy peripheral & central mode.\n\nFor the Arduino MKR WiFi 1010, Arduino UNO WiFi Rev.2, and Arduino Nano 33 IoT boards, it requires the NINA module to be running [Arduino NINA-W102 firmware](https://github.com/arduino/nina-fw) v1.2.0 or later.\n\nFor the Arduino UNO R4 WiFi, it requires the ESP32-S3 module to be running [firmware](https://github.com/arduino/uno-r4-wifi-usb-bridge) v0.2.0 or later.\n\n\nFor more information about this library please visit us at:\nhttps://www.arduino.cc/en/Reference/ArduinoBLE\n\n## License\n\n```\nCopyright (c) 2019 Arduino SA. All rights reserved.\n\nThis library is free software; you can redistribute it and/or\nmodify it under the terms of the GNU Lesser General Public\nLicense as published by the Free Software Foundation; either\nversion 2.1 of the License, or (at your option) any later version.\n\nThis library is distributed in the hope that it will be useful,\nbut WITHOUT ANY WARRANTY; without even the implied warranty of\nMERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU\nLesser General Public License for more details.\n\nYou should have received a copy of the GNU Lesser General Public\nLicense along with this library; if not, write to the Free Software\nFoundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA\n```\n",
      "headings": [
        {
          "level": 1,
          "text": "ArduinoBLE",
          "line": 1
        },
        {
          "level": 2,
          "text": "License",
          "line": 17
        }
      ],
      "c4_level": null,
      "deployable": null
    },
    {
      "path": "embedded/.pio/libdeps/xiaoblesense/Seeed Arduino LSM6DS3/README.md",
      "title": "embedded/.pio/libdeps/xiaoblesense/Seeed Arduino LSM6DS3/README.md",
      "content": "Seeed Arduino LSM6DS3  [![Build Status](https://travis-ci.com/Seeed-Studio/Accelerometer_And_Gyroscope_LSM6DS3.svg?branch=master)](https://travis-ci.com/Seeed-Studio/Accelerometer_And_Gyroscope_LSM6DS3)\n---------------------------------\n\n![](https://statics3.seeedstudio.com/images/product/105020012%203.jpg)\n\nMore detail refer to [wiki page](http://wiki.seeedstudio.com/Grove-6-Axis_AccelerometerAndGyroscope/) and [product page](https://www.seeedstudio.com/Grove-6-Axis-Accelerometer%26Gyroscope-p-2606.html)\n\nExample\n------\n\nExample           | Feature\n----------------- | ----------------------------------------------------\nHighLevelExample  | Using class LSM6DS3\nLowLevelExample   | Using class LSM6DS3Core\nPedometer         | A demo for making a pedometer \nFreeFallDetect    | Detect object free falling, like a falling football\n\n\nAPI\n------\n\nMethods in class LSM6DS3   | Methods in class LSM6DS3Core\n-------------------------- | -------------\nreadRawAccelX              | readRegisterRegion   \nreadRawAccelY              | readRegister         \nreadRawAccelZ              | readRegisterInt16  \nreadRawGyroX               | writeRegister       \nreadRawGyroY               | embeddedPage        \nreadRawGyroZ               | *\nreadFloatAccelX            | *\nreadFloatAccelY            | *\nreadFloatAccelZ            | *\nreadFloatGyroX             | *\nreadFloatGyroY             | *\nreadFloatGyroZ             | *\nreadRawTemp                | *\nreadTempC                  | *\nreadTempF                  | *\ncalcGyro                   | *\ncalcAccel                  | *\n\n----\n\n\nLicense Information\n-------------------\n\nThis product is _**open source**_! \n\nPlease review the LICENSE.md file for license information. \n\n\n\n",
      "headings": [],
      "c4_level": null,
      "deployable": null
    },
    {
      "path": "embedded/.pio/libdeps/xiaoblesense/Seeed Arduino LSM6DS3/LICENSE.md",
      "title": "embedded/.pio/libdeps/xiaoblesense/Seeed Arduino LSM6DS3/LICENSE.md",
      "content": "The original open source library is starting from the SparkFun in Nov 2021.\n\nThe licence for that library is MIT.\n\nThe first evolution of the library is recorded here:\n\nhttps://github.com/sparkfun/SparkFun_LSM6DS3_Arduino_Library\n\nvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvStartvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv\n\nSparkFun License Information\n============================\n\nSparkFun uses two different licenses for our files - one for hardware and one for code.\n\nHardware\n---------\n\n**SparkFun hardware is released under [Creative Commons Share-alike 4.0 International](http://creativecommons.org/licenses/by-sa/4.0/).**\n\nNote: This is a human-readable summary of (and not a substitute for) the [license](http://creativecommons.org/licenses/by-sa/4.0/legalcode).\n\nYou are free to:\n\nShare — copy and redistribute the material in any medium or format\nAdapt — remix, transform, and build upon the material\nfor any purpose, even commercially.\nThe licensor cannot revoke these freedoms as long as you follow the license terms.\nUnder the following terms:\n\nAttribution — You must give appropriate credit, provide a link to the license, and indicate if changes were made. You may do so in any reasonable manner, but not in any way that suggests the licensor endorses you or your use.\nShareAlike — If you remix, transform, or build upon the material, you must distribute your contributions under the same license as the original.\nNo additional restrictions — You may not apply legal terms or technological measures that legally restrict others from doing anything the license permits.\nNotices:\n\nYou do not have to comply with the license for elements of the material in the public domain or where your use is permitted by an applicable exception or limitation.\nNo warranties are given. The license may not give you all of the permissions necessary for your intended use. For example, other rights such as publicity, privacy, or moral rights may limit how you use the material.\n\n\nCode\n--------\n\n**SparkFun code, firmware, and software is released under the [MIT License](http://opensource.org/licenses/MIT).**\n\nThe MIT License (MIT)\n\nCopyright (c) 2015 SparkFun Electronics\n\nPermission is hereby granted, free of charge, to any person obtaining a copy\nof this software and associated documentation files (the \"Software\"), to deal\nin the Software without restriction, including without limitation the rights\nto use, copy, modify, merge, publish, distribute, sublicense, and/or sell\ncopies of the Software, and to permit persons to whom the Software is\nfurnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\nFITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\nAUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\nLIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\nOUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE\nSOFTWARE.\n\n--------------\n\nvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvEndvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv\n\n\nContributions from seeed studio are recorded on GitHub:\n\nhttps://github.com/Seeed-Studio/Seeed_Arduino_LSM6DS3\n\nAdd the Tensorflow lite support\n\nvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvStartvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv\n\nMIT License\n\nCopyright (c) 2020 Seeed Studio\n\nPermission is hereby granted, free of charge, to any person obtaining a copy\nof this software and associated documentation files (the \"Software\"), to deal\nin the Software without restriction, including without limitation the rights\nto use, copy, modify, merge, publish, distribute, sublicense, and/or sell\ncopies of the Software, and to permit persons to whom the Software is\nfurnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\nFITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\nAUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\nLIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\nOUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE\nSOFTWARE.\n\nvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvEndvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv\n",
      "headings": [],
      "c4_level": null,
      "deployable": null
    },
    {
      "path": "embedded/lib/Erlind_project_1_inferencing/src/edge-impulse-sdk/README.md",
      "title": "Edge Impulse DSP and Inferencing SDK",
      "content": "# Edge Impulse DSP and Inferencing SDK\n\nPortable library for digital signal processing and machine learning inferencing. This repository contains the device implementation in C++ for both processing and learning blocks in [Edge Impulse](https://www.edgeimpulse.com).\n\n[Documentation](https://docs.edgeimpulse.com/reference#inferencing-sdk)\n\n## Develop locally\n\nIf you want to develop locally the easiest is to grab the [example-standalone-inferencing](https://github.com/edgeimpulse/example-standalone-inferencing) (Desktop) or [example-standalone-inferencing-mbed](https://github.com/edgeimpulse/example-standalone-inferencing-mbed) (ST IoT Discovery Kit, f.e. to test CMSIS-DSP / CMSIS-NN integration) example applications, add your Edge Impulse project (use the C++ Library export option), then symlink this repository in.\n",
      "headings": [
        {
          "level": 1,
          "text": "Edge Impulse DSP and Inferencing SDK",
          "line": 1
        },
        {
          "level": 2,
          "text": "Develop locally",
          "line": 7
        }
      ],
      "c4_level": null,
      "deployable": null
    },
    {
      "path": "embedded/lib/Erlind_project_1_inferencing/src/edge-impulse-sdk/classifier/postprocessing/tinyEKF/LICENSE.md",
      "title": "embedded/lib/Erlind_project_1_inferencing/src/edge-impulse-sdk/classifier/postprocessing/tinyEKF/LICENSE.md",
      "content": "TinyEKF\n\nCopyright (c) Simon D. Levy\n\nAll rights reserved. \n\nMIT License\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of\nthis software and associated documentation files (the \"\"Software\"\"), to deal in\nthe Software without restriction, including without limitation the rights to\nuse, copy, modify, merge, publish, distribute, sublicense, and/or sell copies\nof the Software, and to permit persons to whom the Software is furnished to do\nso, subject to the following conditions: The above copyright notice and this\npermission notice shall be included in all copies or substantial portions of\nthe Software.  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND,\nEXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF\nMERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO\nEVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES\nOR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,\nARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER\nDEALINGS IN THE SOFTWARE.\n",
      "headings": [],
      "c4_level": null,
      "deployable": null
    },
    {
      "path": "embedded/lib/Erlind_project_1_inferencing/src/edge-impulse-sdk/dsp/README.md",
      "title": "embedded/lib/Erlind_project_1_inferencing/src/edge-impulse-sdk/dsp/README.md",
      "content": "See notes in the various block folders in studio/dsp-pipeline\n\nstudio/dsp-pipeline/mfcc/README.md",
      "headings": [],
      "c4_level": null,
      "deployable": null
    },
    {
      "path": "embedded/lib/Erlind_project_1_inferencing/src/edge-impulse-sdk/dsp/kissfft/README.md",
      "title": "KissFFT",
      "content": "# KissFFT\n\nSoftware FFT library used for devices that do not have hardware accelerated RFFT, or where we want to use mixed-radix FFT. Based off of https://github.com/mborgerding/kissfft.\n",
      "headings": [
        {
          "level": 1,
          "text": "KissFFT",
          "line": 1
        }
      ],
      "c4_level": null,
      "deployable": null
    },
    {
      "path": "embedded/lib/Erlind_project_1_inferencing/src/edge-impulse-sdk/CMSIS/DSP/PrivateInclude/README.md",
      "title": "embedded/lib/Erlind_project_1_inferencing/src/edge-impulse-sdk/CMSIS/DSP/PrivateInclude/README.md",
      "content": "Note: All files have been moved from this folder into Include to simplify build management\n",
      "headings": [],
      "c4_level": null,
      "deployable": null
    },
    {
      "path": "embedded/src/architecture.md",
      "title": "Embedded Sensor-Firmware",
      "content": "# Embedded Sensor-Firmware\n\nDie Firmware liest Sensorwerte aus und überträgt diese über Bluetooth Low Energy (BLE) an die App.\n\n## Datenfluss Firmware\n\n```mermaid\nflowchart TD\n    Sensor[MPU6050 Beschleunigungssensor] -->|I2C Rohdaten| Arduino[Arduino / ESP32 Controller]\n    Arduino -->|Signalfilterung & Skalierung| BLE[Bluetooth Low Energy Characteristic]\n    BLE -->|Notifikationen / Byte-Array| App[Mobile App]\n```\n\n- **Sensordatenerfassung**: Erfolgt in einer festen Frequenz (z.B. 50Hz).\n- **Filterung**: Tiefpassfilter zur Rauschminderung auf dem Mikrocontroller.\n- **BLE-Transfer**: Effiziente Übertragung als binäres Datenpaket.\n",
      "headings": [
        {
          "level": 1,
          "text": "Embedded Sensor-Firmware",
          "line": 1
        },
        {
          "level": 2,
          "text": "Datenfluss Firmware",
          "line": 5
        }
      ],
      "c4_level": null,
      "deployable": null
    },
    {
      "path": "embedded/src/components/gehause/architecture.md",
      "title": "Gehäuse (Enclosure)",
      "content": "<!--\nC4-Ebene: Component\nDeployable: Nein\n-->\n\n# Gehäuse (Enclosure)\n\nDiese Komponente beschreibt das physische, schützende 3D-Druck-Gehäuse des Sensors.\n\n## C4-Architektur-Ebene\n* **C4-Ebene:** Component\n* **Deployable:** Nein (Physische Schutzhülle, keine Software-Ausführung)\n\n## Beschreibung\nDas Gehäuse umschließt den XIAO-Mikrocontroller sowie die Peripherie (Display, Batterie). Es bietet Befestigungslaschen für ein standardmäßiges 20-mm-Sportarmband, um den Sensor stabil am Arm des Nutzers zu fixieren.\n\n## Requirements\n\n**FA2.6**: Das Gerät ist in einem Gehäuse.\n**FA2.6.1**: Schutz der Elektronik vor äußeren Einflüssen.\n**FA2.6.2**: Befestigungsmöglichkeit (z.B. Sportarmband) für stabile Fixierung während des Trainings.\n\n## Technische & Physische Parameter\n- **Gesamtmaße:** 48 mm (Länge) x 24 mm (Breite) x 16 mm (Höhe)\n- **Außenwandstärke:** 2.0 mm\n- **Schließmechanismus:** Schnapp-Deckel (Lippe & Snap Bumps mit 0.2 mm Toleranz)\n- **Komfort:** Abgerundete Ecken (Bevel-Breite 1.5 mm), um Druckstellen beim Tragen zu vermeiden.\n- **Aussparungen:** Integrierter USB-C-Port zur Programmierung und Akku-Ladung.\n\n## Datenfluss\n\n```mermaid\nflowchart LR\n    Xiao[XIAO Controller] -->|Physische Platzierung| Enclosure[3D-Druck Gehäuse]\n    Battery[LiPo-Akku & OLED] -->|Physische Integration| Enclosure\n    Enclosure -->|Armbandlaschen| Arm[Nutzer-Oberarm / Handgelenk]\n    Cable[USB-C Kabel] -->|Aussparung| Xiao\n```\n",
      "headings": [
        {
          "level": 1,
          "text": "Gehäuse (Enclosure)",
          "line": 6
        },
        {
          "level": 2,
          "text": "C4-Architektur-Ebene",
          "line": 10
        },
        {
          "level": 2,
          "text": "Beschreibung",
          "line": 14
        },
        {
          "level": 2,
          "text": "Requirements",
          "line": 17
        },
        {
          "level": 2,
          "text": "Technische & Physische Parameter",
          "line": 23
        },
        {
          "level": 2,
          "text": "Datenfluss",
          "line": 30
        }
      ],
      "c4_level": "Component",
      "deployable": "Nein"
    },
    {
      "path": "embedded/src/components/inferenz_engine/architecture.md",
      "title": "Inferenz-Engine (Edge Impulse)",
      "content": "<!--\nC4-Ebene: Component\nDeployable: Nein\n-->\n\n# Inferenz-Engine (Edge Impulse)\n\nDiese Komponente klassifiziert Übungsausführungen in Echtzeit direkt auf dem Mikrocontroller (Edge Computing).\n\n## C4-Architektur-Ebene\n* **C4-Ebene:** Component\n* **Deployable:** Nein (Läuft als Teil des Sensor Firmware Containers)\n\n## Beschreibung\nDie Inferenz-Engine führt ein CNN-Klassifikationsmodell aus, das über Edge Impulse trainiert und als Arduino-Bibliothek in die Firmware integriert wurde. Es analysiert die 6-Achsen-Bewegungsdaten auf spezifische Übungsqualitäten und Fehlerbilder.\n\n## Requirements\n\n**FA2.2**: Das Gerät erkennt, was für eine Bewegung ausgeführt worden ist.\n**FA2.3**: Das Gerät bewertet die Ausführung der Bewegung.\n\n**FA2.2.1**: Das Gerät erkennt einen Idle Modus\n**FA2.2.2**: Das Gerät erkennt einen Curl\n**FA2.2.3**: Das Gerät erkennt einen shoulder press\n**FA2.2.4**: Das Gerät erkennt einen Lateral raise\n**FA2.2.5**: Das Gerät erkennt eine tricep extension\n\n## Datenfluss\n\n```mermaid\nflowchart TD\n    DSP[DSP Puffer (6 Achsen)] -->|run_classifier| Model[CNN Inferenzmodell]\n    Model -->|Wahrscheinlichkeiten| Eval[Klassenauswertung]\n    Eval -->|Bester Treffer + Score| Output[Feedback & PC-JSON-Stream]\n```\n\n## Technische Details\n- **Modelltyp:** Convolutional Neural Network (CNN)\n- **Erkannte Klassen:**\n  - `idle` / `Idle`: Keine Übungsausführung / Ruhezustand.\n  - `curl` / `curl_sauber` / `CURL`: Korrekt ausgeführter Bizeps-Curl.\n  - `ShoulderPress` / `shoulderpress`: Schulterdrücken.\n  - `lateralraise` / `LateralRaise` / `LateralRaises`: Seitheben.\n  - `fehler_rotation`: Fehlerhafte Ausführung des Bizeps-Curls durch Rotation des Handgelenks.\n  - `fehler_ellbogen`: Fehlerhafte Ausführung des Bizeps-Curls durch Bewegung des Ellbogens.\n- **Anomalieerkennung:** Optionaler K-Means-Clustering-Block zur Erkennung unbekannter Bewegungen.\n",
      "headings": [
        {
          "level": 1,
          "text": "Inferenz-Engine (Edge Impulse)",
          "line": 6
        },
        {
          "level": 2,
          "text": "C4-Architektur-Ebene",
          "line": 10
        },
        {
          "level": 2,
          "text": "Beschreibung",
          "line": 14
        },
        {
          "level": 2,
          "text": "Requirements",
          "line": 17
        },
        {
          "level": 2,
          "text": "Datenfluss",
          "line": 28
        },
        {
          "level": 2,
          "text": "Technische Details",
          "line": 37
        }
      ],
      "c4_level": "Component",
      "deployable": "Nein"
    },
    {
      "path": "embedded/src/components/sensordatenerfassung/architecture.md",
      "title": "Sensordatenerfassung (Loop)",
      "content": "<!--\nC4-Ebene: Component\nDeployable: Nein\nfullfills: FA2.1\n-->\n\n# Sensordatenerfassung (Loop)\n\nDiese Komponente liest kontinuierlich die Rohwerte des Beschleunigungssensors und Gyroskops aus.\n\n## C4-Architektur-Ebene\n* **C4-Ebene:** Component\n* **Deployable:** Nein (Läuft als Teil des Sensor Firmware Containers)\n\n## Beschreibung\nDie Sensordatenerfassung liest in einer festen Schleife (Loop) die 6-Achsen-IMU-Werte (Beschleunigung und Drehung) des LSM6DS3-Sensors über den I2C-Bus ein.\n\n## Requirements\n\n**FA2.1**: Das Gerät sammelt die Dreh- und Beschleunigungsdaten des Trainierenden.\n**FA2.1.1**: Beschleunigung wird eingelesen\n**FA2.1.2**: Drehung wird eingelesen\n\n## Technische Details\n- **Abtastrate:** 50 Hz (gesteuert durch präzises Timing in Microsekunden)\n- **Signal-Clamping:** Beschleunigungswerte werden auf max. ±2.0 G gedämpft/geclampt.\n- **Konvertierung:** Die Werte werden in die SI-Einheit $m/s^2$ konvertiert ($1\\,G = 9.80665\\,m/s^2$).\n- **Verwendete Hardware:** LSM6DS3 IMU auf dem XIAO nRF52840 Sense.\n\n## Datenfluss\n\n```mermaid\nflowchart LR\n    IMU[LSM6DS3 Sensor] -->|I2C Rohdaten| Loop[Loop in Executable.ino]\n    Loop -->|1. Clamping auf 2G| Calc[Skalierung & m/s^2 Konvertierung]\n    Calc -->|2. Puffer befüllen| DSP[Edge Impulse DSP Puffer]\n```\n",
      "headings": [
        {
          "level": 1,
          "text": "Sensordatenerfassung (Loop)",
          "line": 7
        },
        {
          "level": 2,
          "text": "C4-Architektur-Ebene",
          "line": 11
        },
        {
          "level": 2,
          "text": "Beschreibung",
          "line": 15
        },
        {
          "level": 2,
          "text": "Requirements",
          "line": 18
        },
        {
          "level": 2,
          "text": "Technische Details",
          "line": 24
        },
        {
          "level": 2,
          "text": "Datenfluss",
          "line": 30
        }
      ],
      "c4_level": "Component",
      "deployable": "Nein"
    },
    {
      "path": "embedded/src/components/led_display_controller/architecture.md",
      "title": "LED- & Display-Controller",
      "content": "<!--\nC4-Ebene: Component\nDeployable: Nein\nfullfills: FA2.4\n-->\n\n# LED- & Display-Controller\n\nDiese Komponente gibt dem Trainierenden direktes visuelles Feedback zur Qualität und dem Typ der Übungsausführung über die integrierte RGB-LED.\n\n## C4-Architektur-Ebene\n* **C4-Ebene:** Component\n* **Deployable:** Nein (Läuft als Teil des Sensor Firmware Containers)\n\n## Beschreibung\nDer Controller steuert die integrierten Low-Active RGB-LEDs des XIAO-Boards (Pins `LEDR`, `LEDB` und `LEDG`) basierend auf den Klassifikationsergebnissen der Inferenz-Engine. Das ursprüngliche OLED-Display (U8x8) wurde aus Designgründen entfernt, um Gewicht und Energiebedarf einzusparen.\n\n### Feedback-Logik\n- **Warte auf Bluetooth-Verbindung (kein BLE verbunden):**\n  - RGB-LED: **Langsames Blinken (Blau)** (Pin `LEDB` blinkt an/aus)\n- **Ruhemodus (`idle` oder Konfidenz < 60%):**\n  - RGB-LED: **Blau** (Pin `LEDB` auf LOW)\n- **Schulterdrücken (`ShoulderPress`):**\n  - RGB-LED: **Magenta/Lila** (Pins `LEDR` und `LEDB` auf LOW)\n- **Seitheben (`lateralraise` / `LateralRaise` / `LateralRaises`):**\n  - RGB-LED: **Türkis** (Pins `LEDB` und `LEDG` auf LOW)\n- **Saubere Ausführung Bizeps-Curl (`curl` / `curl_sauber`):**\n  - RGB-LED: **Grün** (Pin `LEDG` auf LOW)\n- **Fehlerhafte Ausführung / Sonstiges (z. B. `fehler_rotation`, `fehler_ellbogen`):**\n  - RGB-LED: **Rot** (Pin `LEDR` auf LOW)\n\n## Requirements\n\n**FA2.4**: Das Gerät gibt durch die LED den Verbindungsstatus aus.\n**FA2.4.1**: Ansteuerung der RGB-LED zur Signalisierung von Fehlern (Rot), perfekten Curls (Grün), Seitheben (Türkis), Schulterdrücken (Lila) und Idle/Verbindungsaufbau (Blau).\n\n## Kontrollfluss\n\n```mermaid\nflowchart TD\n    Result[Inferenz-Ergebnis] --> Check{Welche Klasse?}\n    Check -->|idle / <60%| Idle[Blau leuchten]\n    Check -->|ShoulderPress| Shoulder[Magenta/Lila leuchten]\n    Check -->|lateralraise| Lateral[Türkis leuchten]\n    Check -->|curl_sauber| Perfect[Grün leuchten]\n    Check -->|Fehlerklasse / Unbekannt| Error[Rot leuchten]\n```\n",
      "headings": [
        {
          "level": 1,
          "text": "LED- & Display-Controller",
          "line": 7
        },
        {
          "level": 2,
          "text": "C4-Architektur-Ebene",
          "line": 11
        },
        {
          "level": 2,
          "text": "Beschreibung",
          "line": 15
        },
        {
          "level": 3,
          "text": "Feedback-Logik",
          "line": 18
        },
        {
          "level": 2,
          "text": "Requirements",
          "line": 32
        },
        {
          "level": 2,
          "text": "Kontrollfluss",
          "line": 37
        }
      ],
      "c4_level": "Component",
      "deployable": "Nein"
    },
    {
      "path": "embedded/src/components/ble_streamer/architecture.md",
      "title": "BLE-Streamer",
      "content": "<!--\nC4-Ebene: Component\nDeployable: Nein\n-->\n\n# BLE-Streamer\n\nDiese Komponente überträgt die erfassten 6-Achsen-Sensordaten (Beschleunigung und Rotation) in Echtzeit per Bluetooth Low Energy (BLE) an die Mobile App.\n\n## C4-Architektur-Ebene\n* **C4-Ebene:** Component\n* **Deployable:** Nein (Läuft als Teil des Sensor Firmware Containers)\n\n## Beschreibung\nDer BLE-Streamer initialisiert den nRF52840-Bluetooth-Stack, stellt einen GATT-Service mit einer IMU-Characteristic bereit und sendet die gefilterten Sensor-Messwerte (Beschleunigung in X, Y, Z und Drehraten in X, Y, Z) als binären 24-Byte-Puffer (6 float-Werte) an verbundene Clients.\n\n## Requirements\n\n**FA2.5**: Das Gerät versendet die Daten an die App.\n**FA2.5.1**: Aufbau und Aufrechterhaltung einer stabilen Bluetooth LE Verbindung.\n**FA2.5.2**: Serialisierung und Übertragung der Sensordaten mit minimalem Overhead.\n\n## Datenfluss\n\n```mermaid\nflowchart LR\n    IMU[Sensor-Rohwerte] -->|ax, ay, az, gx, gy, gz| Streamer[BLE-Streamer Component]\n    Streamer -->|GATT Notification (24 Bytes)| App[Mobile App useBLE Hook]\n```\n\n### GATT Profile & UUIDs\n* **Service-UUID:** `12345678-1234-1234-1234-123456789012`\n* **Characteristic-UUID:** `12345678-1234-1234-1234-123456789013` (BLERead | BLENotify)\n* **Paketformat:** 24 Bytes (6 float-Werte, IEEE 754 float32, little-endian):\n  `[accelX, accelY, accelZ, gyroX, gyroY, gyroZ]`\n",
      "headings": [
        {
          "level": 1,
          "text": "BLE-Streamer",
          "line": 6
        },
        {
          "level": 2,
          "text": "C4-Architektur-Ebene",
          "line": 10
        },
        {
          "level": 2,
          "text": "Beschreibung",
          "line": 14
        },
        {
          "level": 2,
          "text": "Requirements",
          "line": 17
        },
        {
          "level": 2,
          "text": "Datenfluss",
          "line": 23
        },
        {
          "level": 3,
          "text": "GATT Profile & UUIDs",
          "line": 31
        }
      ],
      "c4_level": "Component",
      "deployable": "Nein"
    },
    {
      "path": "database/architecture.md",
      "title": "MoveLink Database & Backend - Container-Architektur",
      "content": "<!--\nC4-Ebene: Container\nDeployable: Ja\n-->\n\n# MoveLink Database & Backend - Container-Architektur\n\nDieses Dokument beschreibt die Datenbank und den Backend-Service als eigenständigen Container im C4-Modell.\n\n## C4-Architektur-Ebene\n* **C4-Ebene:** Container\n* **Deployable:** Ja\n* **Deployment-Artefakt:** Docker Image / Cloud Service\n* **Technologie-Stack:** Node.js, Express, PostgreSQL / SQLite\n\n## Beschreibung\nDer Datenbank- und Backend-Container dient als zentraler Datenspeicher und API-Gateway für die MoveLink-Applikation. Er nimmt Trainingsdaten und Profile auf, validiert Benutzer und stellt sicher, dass historische Bewegungsdaten zur späteren Analyse persistent abgelegt werden.\n\n## Requirements\n\n**FA3.1**: Das System speichert und verifiziert Benutzerprofile und Anmeldeinformationen persistent.\n**FA3.2**: Das System speichert aufgezeichnete Trainingseinheiten (Übungstyp, Wiederholungen, Qualität) persistent zur historischen Auswertung.\n\n## Komponenten in diesem Container\nDie API- und Datenbankschnittstelle besteht aus folgenden logischen Komponenten:\n1. **ProfileController / Auth Service**: Authentifiziert Benutzer und liefert Profildaten. (Erfüllt: FA3.1)\n2. **Trainings-DB / Session Store**: Speichert und indiziert abgeschlossene Repetitions- und Sessiondaten. (Erfüllt: FA3.2)\n",
      "headings": [
        {
          "level": 1,
          "text": "MoveLink Database & Backend - Container-Architektur",
          "line": 6
        },
        {
          "level": 2,
          "text": "C4-Architektur-Ebene",
          "line": 10
        },
        {
          "level": 2,
          "text": "Beschreibung",
          "line": 16
        },
        {
          "level": 2,
          "text": "Requirements",
          "line": 19
        },
        {
          "level": 2,
          "text": "Komponenten in diesem Container",
          "line": 24
        }
      ],
      "c4_level": "Container",
      "deployable": "Ja"
    },
    {
      "path": "app/architecture.md",
      "title": "MoveLink Mobile App - Container-Architektur",
      "content": "# MoveLink Mobile App - Container-Architektur\n\nDieses Dokument beschreibt die Mobile App als eigenständige, deploybare Einheit im C4-Modell.\n\n## C4-Architektur-Ebene\n* **C4-Ebene:** Container\n* **Deployable:** Ja\n* **Deployment-Artefakt:** Android Package (.apk) / iOS IPA\n* **Technologie-Stack:** React Native, Expo, TypeScript, Zustand, BLE PLX\n\n## Beschreibung\nDie MoveLink Mobile App ist die primäre Benutzerschnittstelle des Systems. Sie läuft auf Android- und iOS-Endgeräten und verbindet sich über Bluetooth Low Energy (BLE) mit dem embedded Sensor-Gerät, um Bewegungsdaten in Echtzeit zu erfassen, zu visualisieren und zur persistenten Speicherung an das Backend zu übertragen.\n\n```mermaid\nflowchart TD\n    User[Trainierender] -->|Interagiert mit| App[React Native App Container]\n    App -->|BLE Bluetooth| Sensor[Sensor Firmware Container]\n    App -->|REST/WebSockets| Backend[Backend API Container]\n```\n\n## Requirements\n\n**FA1.1**: Die App bietet eine Navigationsstruktur (Reiter/Menü) für Hardwaregeräte, Trainings und vergangene Einheiten.\n**FA1.1.1**: Die App bietet eine Seiten-Navigation (Drawer/SideNav) auf Tablets und Web.\n**FA1.1.2**: Die App bietet eine untere Tableiste (Tabs) auf Mobiltelefonen.\n**FA1.2**: Die App ermöglicht das Scannen nach verfügbaren Bluetooth-Sensorgeräten.\n**FA1.3**: Die App baut eine stabile Bluetooth-Verbindung zum Sensor auf.\n**FA1.4**: Die App demonstriert grafisch die auszuführende Übungsausführung (z. B. via Lottie-Animation).\n**FA1.5**: Die App visualisiert die empfangenen Sensordaten und den Übungsfortschritt in Echtzeit.\n**FA1.6**: Die App zeigt historische Trainingseinheiten grafisch und statistisch an.\n**FA1.7**: Die App zeigt Profildetails des Benutzers an.\n\n\n## Komponenten in diesem Container\nDie App enthält mehrere Komponenten (C4-Komponenten-Ebene):\n1. **[SideNav](file:///home/arch/repo/movelink/app/components/side_nav/SideNav.tsx)**: Navigationskomponente für die App-Steuerung. (Erfüllt: FA1.1, FA1.1.1)\n2. **[SensorCard](file:///home/arch/repo/movelink/app/components/sensor_card/SensorCard.tsx)**: Verwaltung der BLE-Geräteverbindung und Pairing. (Erfüllt: FA1.2, FA1.3, NF3)\n3. **[LiveChart](file:///home/arch/repo/movelink/app/components/live_chart/LiveChart.tsx)**: Echtzeit-Visualisierung der IMU-Beschleunigungs- und Gyroskopwerte. (Erfüllt: FA1.5)\n4. **[SessionCard](file:///home/arch/repo/movelink/app/components/session_card/SessionCard.tsx)**: Visualisierung historischer Trainingseinheiten. (Erfüllt: FA1.6)\n5. **[BLE-Hook (useBLE)](file:///home/arch/repo/movelink/app/hooks/useBLE.ts)**: Kapselt die Bluetooth-Gerätekommunikation und den Reconnect. (Erfüllt: FA1.3, NF2)\n6. **[ProfileCard](file:///home/arch/repo/movelink/app/components/ProfileCard/architecture.md)**: Visualisierung der Benutzerprofildetails. (Erfüllt: FA1.7)\n",
      "headings": [
        {
          "level": 1,
          "text": "MoveLink Mobile App - Container-Architektur",
          "line": 1
        },
        {
          "level": 2,
          "text": "C4-Architektur-Ebene",
          "line": 5
        },
        {
          "level": 2,
          "text": "Beschreibung",
          "line": 11
        },
        {
          "level": 2,
          "text": "Requirements",
          "line": 21
        },
        {
          "level": 2,
          "text": "Komponenten in diesem Container",
          "line": 34
        }
      ],
      "c4_level": "Container",
      "deployable": "Ja"
    },
    {
      "path": "app/components/sensor_card/architecture.md",
      "title": "SensorCard UI-Komponente",
      "content": "<!--\nC4-Ebene: Component\nDeployable: Nein\n-->\n\n# SensorCard UI-Komponente\n\nDiese Komponente ermöglicht dem Benutzer das Scannen nach MoveLink-Sensoren und das Herstellen/Trennen der Bluetooth-Verbindung.\n\n## C4-Architektur-Ebene\n* **C4-Ebene:** Component\n* **Deployable:** Nein (Läuft als Teil des Mobile App Containers)\n\n## Beschreibung\nDie SensorCard stellt ein gläsernes Benutzeroberflächenelement bereit, das den aktuellen Bluetooth-Verbindungsstatus (getrennt, verbindend, verbunden) anzeigt. Sie steuert den Scanvorgang und erlaubt es, ein aktives Pairing durchzuführen oder zu beenden.\n\n## Requirements\n\n**FA1.2**: Die App ermöglicht das Scannen nach verfügbaren Bluetooth-Sensorgeräten.\n**FA1.3**: Die App baut eine stabile Bluetooth-Verbindung zum Sensor auf.\n**NF3**: Das Bluetooth-Pairing mit dem Sensor darf maximal zwei manuelle Interaktionen erfordern.\n\n## Datenfluss\n\n```mermaid\nflowchart LR\n    UI[SensorCard UI] -->|onScan / Klick| Hook[useBLE Hook]\n    Hook -->|Statusänderung| Store[useBLEStore]\n    Store -->|Reaktive Props| UI\n```\n",
      "headings": [
        {
          "level": 1,
          "text": "SensorCard UI-Komponente",
          "line": 6
        },
        {
          "level": 2,
          "text": "C4-Architektur-Ebene",
          "line": 10
        },
        {
          "level": 2,
          "text": "Beschreibung",
          "line": 14
        },
        {
          "level": 2,
          "text": "Requirements",
          "line": 17
        },
        {
          "level": 2,
          "text": "Datenfluss",
          "line": 23
        }
      ],
      "c4_level": "Component",
      "deployable": "Nein"
    },
    {
      "path": "app/components/side_nav/architecture.md",
      "title": "SideNav UI-Komponente",
      "content": "<!--\nC4-Ebene: Component\nDeployable: Nein\n-->\n\n# SideNav UI-Komponente\n\nDiese Navigationskomponente dient als zentrale Steuereinheit auf größeren Displays (Tablets, Web).\n\n## C4-Architektur-Ebene\n* **C4-Ebene:** Component\n* **Deployable:** Nein (Läuft als Teil des Mobile App Containers)\n\n## Beschreibung\nDie SideNav bietet ein einklappbares Seitenmenü zur Navigation zwischen den Tabs (Training, Verlauf, Einstellungen). Sie optimiert die Benutzeroberfläche auf Tablets und Webansichten.\n\n## Requirements\n\n**FA1.1**: Die App bietet eine Navigationsstruktur (Reiter/Menü) für Hardwaregeräte, Trainings und vergangene Einheiten.\n**FA1.1.1**: Die App bietet eine Seiten-Navigation (Drawer/SideNav) auf Tablets und Web.\n\n## Datenfluss\n\n```mermaid\nflowchart LR\n    User[Nutzer] -->|Tippt Menüpunkt| Nav[SideNav UI]\n    Nav -->|Navigation Trigger| Router[Expo Router]\n    Router -->|Screen Update| User\n```\n",
      "headings": [
        {
          "level": 1,
          "text": "SideNav UI-Komponente",
          "line": 6
        },
        {
          "level": 2,
          "text": "C4-Architektur-Ebene",
          "line": 10
        },
        {
          "level": 2,
          "text": "Beschreibung",
          "line": 14
        },
        {
          "level": 2,
          "text": "Requirements",
          "line": 17
        },
        {
          "level": 2,
          "text": "Datenfluss",
          "line": 22
        }
      ],
      "c4_level": "Component",
      "deployable": "Nein"
    },
    {
      "path": "app/components/live_chart/architecture.md",
      "title": "LiveChart UI-Komponente",
      "content": "<!--\nC4-Ebene: Component\nDeployable: Nein\n-->\n\n# LiveChart UI-Komponente\n\nDiese Komponente zeichnet eintreffende 6-Achsen-Messwerte der Sensordatenerfassung in Echtzeit auf einem grafischen Canvas.\n\n## C4-Architektur-Ebene\n* **C4-Ebene:** Component\n* **Deployable:** Nein (Läuft als Teil des Mobile App Containers)\n\n## Beschreibung\nDie LiveChart visualisiert den Kurvenverlauf der Beschleunigung (X, Y, Z) und optional des Gyroskops (X, Y, Z) in Echtzeit. Sie erhält kontinuierlich Updates vom BLE-Datenstrom und zeichnet diese flüssig als SVG-Pfade, um eine Latenz unterhalb der Akzeptanzgrenze (NF1) zu garantieren.\n\n## Requirements\n\n**FA1.5**: Die App visualisiert die empfangenen Sensordaten und den Übungsfortschritt in Echtzeit.\n**NF1**: Die End-to-End-Latenz von der physischen Sensorbewegung bis zur visuellen Darstellung in der App muss ≤ 100 ms sein.\n\n## Datenfluss\n\n```mermaid\nflowchart LR\n    BLE[useBLE Hook] -->|Neue IMU-Werte| Store[useBLEStore]\n    Store -->|latestReading| Screen[Training Screen]\n    Screen -->|Datenpuffer (Buffer)| Chart[LiveChart Component]\n    Chart -->|SVG Render| Canvas[Bildschirm-Anzeige]\n```\n",
      "headings": [
        {
          "level": 1,
          "text": "LiveChart UI-Komponente",
          "line": 6
        },
        {
          "level": 2,
          "text": "C4-Architektur-Ebene",
          "line": 10
        },
        {
          "level": 2,
          "text": "Beschreibung",
          "line": 14
        },
        {
          "level": 2,
          "text": "Requirements",
          "line": 17
        },
        {
          "level": 2,
          "text": "Datenfluss",
          "line": 22
        }
      ],
      "c4_level": "Component",
      "deployable": "Nein"
    },
    {
      "path": "app/components/ProfileCard/architecture.md",
      "title": "Profil-Karte (ProfileCard)",
      "content": "# Profil-Karte (ProfileCard)\n\nDiese Komponente zeigt die Profildetails des angemeldeten Benutzers an.\n\n## C4-Architektur-Ebene\n* **C4-Ebene:** Component\n* **Deployable:** Nein (Läuft als Teil des Mobile App Containers)\n\n## Datenfluss\n```mermaid\nflowchart LR\n    JWT[Authentifizierungs-Token] -->|1. User-ID auslesen| Controller[ProfileController]\n    Controller -->|2. Query| DB[(Datenbank)]\n    DB -->|3. Rohdaten| Controller\n    Controller -->|4. Bereinigtes Profil DTO| Client[ProfileCard UI]\n```\n",
      "headings": [
        {
          "level": 1,
          "text": "Profil-Karte (ProfileCard)",
          "line": 1
        },
        {
          "level": 2,
          "text": "C4-Architektur-Ebene",
          "line": 5
        },
        {
          "level": 2,
          "text": "Datenfluss",
          "line": 9
        }
      ],
      "c4_level": "Component",
      "deployable": "Nein"
    },
    {
      "path": "app/components/session_card/architecture.md",
      "title": "SessionCard UI-Komponente",
      "content": "<!--\nC4-Ebene: Component\nDeployable: Nein\n-->\n\n# SessionCard UI-Komponente\n\nDiese Komponente visualisiert die Zusammenfassung und Statistiken einer abgeschlossenen Trainingseinheit.\n\n## C4-Architektur-Ebene\n* **C4-Ebene:** Component\n* **Deployable:** Nein (Läuft als Teil des Mobile App Containers)\n\n## Beschreibung\nDie SessionCard stellt historische Trainingsdaten strukturiert dar, darunter das Datum, die Übungsart (z.B. Bizeps-Curls), die Anzahl der Wiederholungen sowie die durchschnittliche Ausführungsqualität.\n\n## Requirements\n\n**FA1.6**: Die App zeigt historische Trainingseinheiten grafisch und statistisch an.\n\n## Datenfluss\n\n```mermaid\nflowchart LR\n    DB[(Backend / API)] -->|HTTP JSON Response| Screen[History Screen]\n    Screen -->|Session DTO| Card[SessionCard UI]\n```\n",
      "headings": [
        {
          "level": 1,
          "text": "SessionCard UI-Komponente",
          "line": 6
        },
        {
          "level": 2,
          "text": "C4-Architektur-Ebene",
          "line": 10
        },
        {
          "level": 2,
          "text": "Beschreibung",
          "line": 14
        },
        {
          "level": 2,
          "text": "Requirements",
          "line": 17
        },
        {
          "level": 2,
          "text": "Datenfluss",
          "line": 21
        }
      ],
      "c4_level": "Component",
      "deployable": "Nein"
    },
    {
      "path": "doc/UseCases.md",
      "title": "Anwendungsfälle (Use Cases)",
      "content": "# Anwendungsfälle (Use Cases)\n\nHier werden die primären Interaktionen zwischen dem Trainierenden und dem MoveLink-System beschrieben.\n\n---\n\n**UC-1**: Trainingsgerät verbinden\n* **Akteur**: Trainierender\n* **Vorbedingung**: Trainingsgerät ist eingeschaltet und befindet sich in Reichweite.\n* **Beschreibung**: Als Trainierender möchte ich mein Trainingsgerät mit der App verbinden, um Trainingsdaten erfassen zu können.\n* **Ablauf (Szenario)**:\n  1. **Eingabe**: Der Trainierende öffnet die App.\n     **Ausgabe**: Die App zeigt eine Möglichkeit/einen Reiter für Hardwaregeräte an.\n  2. **Eingabe**: Der Trainierende klicke auf den Reiter \"Hardwaregeräte\".\n     **Ausgabe**: Die App zeigt eine Liste der verfügbaren Hardwaregeräte sowie den aktuellen Verbindungsstatus an.\n  3. **Eingabe**: Der Trainierende wählt ein Hardwaregerät aus der Liste aus und klickt auf \"Verbinden\".\n     **Ausgabe**: Die App zeigt die Detailansicht des ausgewählten Geräts und bestätigt den erfolgreichen Verbindungsaufbau.\n\n---\n\n**UC-2**: Echtzeit-Training überwachen\n* **Akteur**: Trainierender\n* **Vorbedingung**: Das Trainingsgerät ist erfolgreich mit der App verbunden.\n* **Beschreibung**: Ich als Trainierender möchte mein Training in Echtzeit überwachen können, um direkt Feedback zu meiner Ausführung zu erhalten.\n* **Ablauf (Szenario)**:\n  1. **Eingabe**: Der Trainierende öffnet die App.\n     **Ausgabe**: Die App zeigt die Option zum Starten eines Trainings an.\n  2. **Eingabe**: Der Trainierende klickt auf \"Training starten\".\n     **Ausgabe**: Die App zeigt die Detailansicht des ausgewählten Trainings sowie die Start-Schaltfläche.\n  3. **Eingabe**: Der Trainierende drückt den \"Start\"-Button.\n     **Ausgabe**: Die App demonstriert grafisch die auszuführende Übungsbewegung. *(Bezug: FA8)*\n  4. **Eingabe**: Der Trainierende führt die Bewegung aus.\n     **Ausgabe**: Die App visualisiert die Bewegung in Echtzeit, vergleicht sie mit der Zielvorgabe und gibt positives Feedback bei korrekter Ausführung. *(Bezug: FA5, FA6, FA9)*\n\n---\n\n**UC-3**: Trainingsdaten einsehen\n* **Akteur**: Trainierender\n* **Vorbedingung**: Mindestens eine aufgezeichnete Trainingseinheit ist in der Datenbank vorhanden.\n* **Beschreibung**: Ich als Trainierender möchte vergangene Trainingseinheiten einsehen können, um meine Fortschritte zu verfolgen.\n* **Ablauf (Szenario)**:\n  1. **Eingabe**: Der Trainierende öffnet die App.\n     **Ausgabe**: Die App bietet eine Option zum Einsehen des Trainingsverlaufs.\n  2. **Eingabe**: Der Trainierende navigiert zum Reiter \"Trainingseinheiten\".\n     **Ausgabe**: Die App listet alle vergangenen Trainingseinheiten chronologisch auf.\n  3. **Eingabe**: Der Trainierende wählt eine Trainingseinheit aus der Liste aus.\n     **Ausgabe**: Die App bereitet die historischen Bewegungsdaten grafisch und statistisch auf.",
      "headings": [
        {
          "level": 1,
          "text": "Anwendungsfälle (Use Cases)",
          "line": 1
        }
      ],
      "c4_level": null,
      "deployable": null
    },
    {
      "path": "doc/Requirements.md",
      "title": "Systemanforderungen (Requirements)",
      "content": "# Systemanforderungen (Requirements)\n\nDieses Dokument definiert die funktionalen und nicht-funktionalen Anforderungen sowie die Randbedingungen des MoveLink-Systems.\n\n---\n\n## Funktionale Anforderungen //Was für Instanzen existieren denn eigentlich.\n\n**FA1**: Es wird eine Applikation angeboten, welche als Input für die Steuerung für den Benutzer dient. (UC-1, UC-2, UC-3)\n\n**FA2**: Zu dem System wird ein Trainingsgerät benötigt, welche als Input für der Bewegungen des Benutzers dient. Dieses Gerät gibt die Sensorwerte als auch die Art der Bewegung zurück. (UC-1, UC-2)\n\n**FA3**: Es wird eine Datenbank benötigt, welche die Daten des Benutzers speichert. (UC-1, UC-3)\n\n---\n\n## Nicht-funktionale Anforderungen\n\n**NF1**: Latenz\nDie End-to-End-Latenz von der physischen Sensorbewegung bis zur visuellen Darstellung in der App muss ≤ 100 ms sein.\n\n**NF2**: Zuverlässigkeit und Reconnect\nBei Verbindungsabbrüchen muss die App den Nutzer umgehend benachrichtigen und automatische Wiederverbindungsversuche (Reconnect) starten.\n\n**NF3**: Benutzbarkeit (Usability)\nDas Bluetooth-Pairing mit dem Sensor darf maximal zwei manuelle Interaktionen erfordern.\n\n---\n\n## Randbedingungen\n\n**R1**: Plattform-Kompatibilität\nDie mobile Applikation muss nativ oder als hybride App auf Android-Geräten lauffähig sein.\n\n\n## Abwägungen\n\nHardware/Gerät:\n| vorgefertigtes Gerät (Fitbit) | Hybrid (XIAO seed NRF52840) | Eigene Lösung (PCB) |\n|----------|----------|----------|\n| + Klein und ausgereift    | + Kostengünstig, integrierte IMU & BLE    | + Maximale Kontrolle über Formfaktor und Sensoren    |\n| - Teuer    | - Gehäuse muss selbst konstruiert/gedruckt werden    | - Sehr hohe Entwicklungskosten und Time-to-Market    |\n| - Schlecht erweiterbar durch andere Sensoren    | - Höherer Integrationsaufwand als fertiges Konsumentenprodukt    | - Komplexes PCB-Design und Fertigungsrisiko    |\n\nEntscheidung: XIAO seed NRF52840\n\n\nApp:\n| Ionic (Flutter)  | Hybrid (React Native) | Native IOS Swift/Android Java |\n|----------|----------|----------|\n| + Schnelles Prototyping und einfache Web-Technologien    | + Hohe Code-Wiederverwendbarkeit und schnelle UI-Iterationen    | + Optimale Bluetooth-Leistung und direkter API-Zugriff    |\n| - Performance-Einbußen bei 50Hz Echtzeit-Diagrammen    | - BLE-Bibliotheken von Drittanbietern erfordern Wartung    | - Hohe Entwicklungskosten durch zwei separate Codebases    |\n| - Komplexere native Bluetooth-Anbindung über Plugins    | - Performance-Overhead durch JS-Bridge bei kontinuierlichem Datenstrom    | - Längere Time-to-Market und aufwendige doppelte Pflege    |\n\nEntscheidung: Hybrid (React Native)\n\nBewegungsauswertung:\nDie Bewertung\n\n| Auf dem Gerät | Komplett in der App | Hybrid |\n|----------|----------|----------|\n| + Per Edge Impulse einfach umzusetzende Inferenz    | + Genug Rechenleistung für komplexe Deep-Learning-Modelle    | + MCU filtert/komprimiert Daten; App übernimmt Inferenz    |\n| - Begrenzte Speicher- und Rechenkapazitäten der MCU    | - Hohe BLE-Datenrate (50Hz Rohdatenstrom) erforderlich    | - Höhere Systemkomplexität durch geteilte Logik    |\n| - Modell-Updates erfordern Firmware-Flashen    | - Erhöhter Akkuverbrauch auf dem Mobilgerät    | - Komplexeres Debugging bei Übertragungsverzögerungen    |\n\nEntscheidung: Auf dem Gerät (Edge-Inferenz)",
      "headings": [
        {
          "level": 1,
          "text": "Systemanforderungen (Requirements)",
          "line": 1
        },
        {
          "level": 2,
          "text": "Funktionale Anforderungen //Was für Instanzen existieren denn eigentlich.",
          "line": 7
        },
        {
          "level": 2,
          "text": "Nicht-funktionale Anforderungen",
          "line": 17
        },
        {
          "level": 2,
          "text": "Randbedingungen",
          "line": 30
        },
        {
          "level": 2,
          "text": "Abwägungen",
          "line": 36
        }
      ],
      "c4_level": null,
      "deployable": null
    },
    {
      "path": "doc/AI_DOCUMENTATION_GUIDE.md",
      "title": "Leitfaden für KI-Dokumentation & Traceability (MoveLink)",
      "content": "# Leitfaden für KI-Dokumentation & Traceability (MoveLink)\n\nDieses Repository verwendet ein automatisiertes, integriertes Dokumentations- und Traceability-System. Es scannt Markdown-Dokumente und Quellcode-Dateien, um eine interaktive Weboberfläche (HTML Dashboard) sowie einen kompilierten PDF-Bericht zu generieren.\n\nDamit zukünftige KIs und Entwickler neue Anforderungen, Use Cases und Architekturentwicklungen richtig dokumentieren, müssen die folgenden Standards eingehalten werden.\n\n---\n\n## 1. Definition von Anforderungen & Use Cases (.md-Dateien)\n\nAlle Systemdefinitionen werden in Markdown-Dateien im Ordner `doc/` gepflegt (z. B. `doc/Requirements.md` und `doc/UseCases.md`).\n\n### ID-Format & Konventionen\nJeder Eintrag muss eine eindeutige ID besitzen:\n* **`UC-X`**: Use Cases (z. B. `UC-1`)\n* **`FA-X`**: Funktionale Anforderungen (z. B. `FA1`)\n* **`NF-X`**: Nicht-funktionale Anforderungen (z. B. `NF1`)\n* **`R-X`**: Randbedingungen (z. B. `R1`)\n\n### Format der Deklaration in Markdown\nIn den jeweiligen subdirectories befinden sich architecture.md Dateien. Diese Dateien beschreiben die Architektur der jeweiligen Komponente oder des Containers. Damit der Scraper (`scrape_docs.py`) die Einträge korrekt parsen kann, müssen sie in einer Zeile deklariert werden, gefolgt von einer Beschreibung. Der Aufbau sieht folgendermaßen aus:\n\n# <Name>\n## C4-Architektur-Ebene\n## Beschreibung\n## Requirements\n## Datenfluss\n## Abwägungen\n## Technische Details\n\ndie technischen Details sind optinal. Ein Beispiel hierfür ist am Ende des Dokuments.\n\n### Verknüpfung zwischen Anforderungen und Use Cases (Traceability)\nUm Anforderungen mit Use Cases zu verknüpfen, muss die Use-Case-ID in Klammern oder als Text in der Zeile der Anforderung stehen. Der Scraper sucht nach Querverweisen (z. B. `(UC-1)`):\n\n```markdown\n**FA3: BLE Verbindungsaufbau (UC-1)**\nDas System muss eine Bluetooth Low Energy Verbindung zum Sensor herstellen.\n```\n\n---\n\n## 2. Implementierungs-Referenzen im Quellcode (@implements)\n\nUm nachzuweisen, dass eine Anforderung tatsächlich im Code implementiert wurde, müssen Entwickler und KIs direkt in den Quellcodedateien (`.ts`, `.tsx`, `.ino`, `.cpp`, `.h`) `@implements`-Annotationen in Kommentaren hinzufügen.\n\n### Syntax\n```\n@implements ID1, ID2, ...\n```\n\n### Code-Beispiele\n\n**In TypeScript / TSX Dateien (`app/`):**\n```tsx\n// @implements FA2, FA3, NF2\nexport function SensorCard() {\n    // UI Code...\n}\n```\n\n**In Arduino / C++ Dateien (`embedded/`):**\n```cpp\n/*\n * @implements FA5, NF1\n * Liest Sensorwerte mit 50Hz aus und wendet einen Tiefpassfilter an.\n */\nvoid loop() {\n    // Sensorsignal...\n}\n```\n\n---\n\n## 3. C4-Architektur-Modellierung (Metadaten-Blöcke)\n\nJedes Architektur-Dokument in Markdown muss Informationen über die zugehörige C4-Ebene und die Deployability enthalten.\n\n### Metadaten-Header in Markdown\nFügen Sie ganz oben in der entsprechenden Architektur-Markdown-Datei (z. B. `app/architecture.md`) einen HTML-Kommentarblock mit folgenden Keys hinzu:\n\n```markdown\n<!--\nC4-Ebene: Container\nDeployable: Ja\n-->\n```\n\n**Erlaubte Werte:**\n* **C4-Ebene**: `System-Context`, `Container`, `Component`\n* **Deployable**: `Ja` / `Nein` (oder `Yes` / `No`)\n\n### Registrierung im C4 Model Explorer\nWenn ein neuer Container oder eine neue Komponente hinzugefügt wird, muss diese auch in der `C4_DATA`-Struktur am Ende von `docs_site/app.js` registriert werden:\n1. Tragen Sie das Element unter `containers.elements` oder `components.[container_id].elements` ein.\n2. Definieren Sie dessen Verbindungen (Connectoren) im zugehörigen `connections`-Array.\n3. Ergänzen Sie die Dateizuordnung in der Funktion `getC4ElementForFile` in `docs_site/app.js`, damit die E2E-Flussdiagramme die Datei dem neuen C4-Element zuweisen.\n\n---\n\n## 4. Build-Prozess & Pipeline\n\nNach jeder Änderung an der Dokumentation oder den `@implements`-Kommentaren im Quellcode müssen die Kompilierungsskripte ausgeführt werden:\n\n### Lokaler Build-Befehl\n1. **Scraper ausführen** (erstellt `docs_site/data.js`):\n   ```bash\n   python scrape_docs.py\n   ```\n2. **PDF Bericht generieren** (erstellt `docs_site/documentation_report.pdf`):\n   ```bash\n   python generate_pdf.py\n   ```\n\n### CI/CD Pipeline (GitHub Actions)\nBei jedem Push auf den `main`-Branch baut die Pipeline `.github/workflows/docs.yml` die Webseite und das PDF automatisch. Wenn Sie einen Commit pushen, der bereits kompilierte Änderungen enthält, nutzen Sie `[skip ci]` im Commit-Betreff, um endlose Build-Loops zu verhindern.\n\n\n## 5. Beispiel für eine architecture.md Datei\n# Inferenz-Engine (Edge Impulse)\n\nDiese Komponente klassifiziert Übungsausführungen in Echtzeit direkt auf dem Mikrocontroller (Edge Computing).\n\n## C4-Architektur-Ebene\n* **C4-Ebene:** Component\n* **Deployable:** Nein (Läuft als Teil des Sensor Firmware Containers)\n\n## Beschreibung\nDie Inferenz-Engine führt ein CNN-Klassifikationsmodell aus, das über Edge Impulse trainiert und als Arduino-Bibliothek in die Firmware integriert wurde. Es analysiert die 6-Achsen-Bewegungsdaten auf spezifische Übungsqualitäten und Fehlerbilder.\n\n## Requirements\n\n**FA2.2**: Das Gerät erkennt, was für eine Bewegung ausgeführt worden ist.\n**FA2.3**: Das Gerät bewertet die Ausführung der Bewegung.\n\n**FA2.2.1**: Das Gerät erkennt einen Idle Modus\n**FA2.2.2**: Das Gerät erkennt einen Curl\n**FA2.2.3**: Das Gerät erkennt einen shoulder press\n**FA2.2.4**: Das Gerät erkennt einen Lateral raise\n**FA2.2.5**: Das Gerät erkennt eine tricep extension\n\n## Datenfluss\n\n```mermaid\nflowchart TD\n    DSP[DSP Puffer (6 Achsen)] -->|run_classifier| Model[CNN Inferenzmodell]\n    Model -->|Wahrscheinlichkeiten| Eval[Klassenauswertung]\n    Eval -->|Bester Treffer + Score| Output[Feedback & PC-JSON-Stream]\n```\n\n## Abwägungen\n\nBewegungsauswertung:\nDie Bewertung\n\n| Auf dem Gerät | Komplett in der App | Hybrid |\n|----------|----------|----------|\n| + Per Edge Impulse einfach umzusetzende Inferenz    | + Genug Rechenleistung für komplexe Deep-Learning-Modelle    | + MCU filtert/komprimiert Daten; App übernimmt Inferenz    |\n| - Begrenzte Speicher- und Rechenkapazitäten der MCU    | - Hohe BLE-Datenrate (50Hz Rohdatenstrom) erforderlich    | - Höhere Systemkomplexität durch geteilte Logik    |\n| - Modell-Updates erfordern Firmware-Flashen    | - Erhöhter Akkuverbrauch auf dem Mobilgerät    | - Komplexeres Debugging bei Übertragungsverzögerungen    |\n\n\n## Technische Details\n- **Modelltyp:** Convolutional Neural Network (CNN)\n- **Erkannte Klassen:**\n  - `idle`: Keine Übungsausführung / Ruhezustand.\n  - `curl_sauber`: Korrekt ausgeführter Bizeps-Curl.\n  - `fehler_rotation`: Fehlerhafte Ausführung durch Rotation des Handgelenks.\n  - `fehler_ellbogen`: Fehlerhafte Ausführung durch Bewegung des Ellbogens.\n- **Anomalieerkennung:** Optionaler K-Means-Clustering-Block zur Erkennung unbekannter Bewegungen.\n",
      "headings": [
        {
          "level": 1,
          "text": "Leitfaden für KI-Dokumentation & Traceability (MoveLink)",
          "line": 1
        },
        {
          "level": 2,
          "text": "1. Definition von Anforderungen & Use Cases (.md-Dateien)",
          "line": 9
        },
        {
          "level": 3,
          "text": "ID-Format & Konventionen",
          "line": 13
        },
        {
          "level": 3,
          "text": "Format der Deklaration in Markdown",
          "line": 20
        },
        {
          "level": 1,
          "text": "<Name>",
          "line": 23
        },
        {
          "level": 2,
          "text": "C4-Architektur-Ebene",
          "line": 24
        },
        {
          "level": 2,
          "text": "Beschreibung",
          "line": 25
        },
        {
          "level": 2,
          "text": "Requirements",
          "line": 26
        },
        {
          "level": 2,
          "text": "Datenfluss",
          "line": 27
        },
        {
          "level": 2,
          "text": "Abwägungen",
          "line": 28
        },
        {
          "level": 2,
          "text": "Technische Details",
          "line": 29
        },
        {
          "level": 3,
          "text": "Verknüpfung zwischen Anforderungen und Use Cases (Traceability)",
          "line": 33
        },
        {
          "level": 2,
          "text": "2. Implementierungs-Referenzen im Quellcode (@implements)",
          "line": 43
        },
        {
          "level": 3,
          "text": "Syntax",
          "line": 47
        },
        {
          "level": 3,
          "text": "Code-Beispiele",
          "line": 52
        },
        {
          "level": 2,
          "text": "3. C4-Architektur-Modellierung (Metadaten-Blöcke)",
          "line": 75
        },
        {
          "level": 3,
          "text": "Metadaten-Header in Markdown",
          "line": 79
        },
        {
          "level": 3,
          "text": "Registrierung im C4 Model Explorer",
          "line": 93
        },
        {
          "level": 2,
          "text": "4. Build-Prozess & Pipeline",
          "line": 101
        },
        {
          "level": 3,
          "text": "Lokaler Build-Befehl",
          "line": 105
        },
        {
          "level": 3,
          "text": "CI/CD Pipeline (GitHub Actions)",
          "line": 115
        },
        {
          "level": 2,
          "text": "5. Beispiel für eine architecture.md Datei",
          "line": 119
        },
        {
          "level": 1,
          "text": "Inferenz-Engine (Edge Impulse)",
          "line": 120
        },
        {
          "level": 2,
          "text": "C4-Architektur-Ebene",
          "line": 124
        },
        {
          "level": 2,
          "text": "Beschreibung",
          "line": 128
        },
        {
          "level": 2,
          "text": "Requirements",
          "line": 131
        },
        {
          "level": 2,
          "text": "Datenfluss",
          "line": 142
        },
        {
          "level": 2,
          "text": "Abwägungen",
          "line": 151
        },
        {
          "level": 2,
          "text": "Technische Details",
          "line": 163
        }
      ],
      "c4_level": "Component",
      "deployable": "Nein"
    }
  ],
  "definitions": {
    "FA2.1": {
      "id": "FA2.1",
      "title": "Das Gerät sammelt die Dreh- und Beschleunigungsdaten des Trainierenden.",
      "file": "embedded/src/components/sensordatenerfassung/architecture.md",
      "line": 20,
      "links": [],
      "type": "FA"
    },
    "FA2.2": {
      "id": "FA2.2",
      "title": "Das Gerät erkennt, was für eine Bewegung ausgeführt worden ist.",
      "file": "doc/AI_DOCUMENTATION_GUIDE.md",
      "line": 133,
      "links": [],
      "type": "FA"
    },
    "FA2.3": {
      "id": "FA2.3",
      "title": "Das Gerät bewertet die Ausführung der Bewegung.",
      "file": "doc/AI_DOCUMENTATION_GUIDE.md",
      "line": 134,
      "links": [],
      "type": "FA"
    },
    "FA2.4": {
      "id": "FA2.4",
      "title": "Das Gerät gibt durch die LED den Verbindungsstatus aus.",
      "file": "embedded/src/components/led_display_controller/architecture.md",
      "line": 34,
      "links": [],
      "type": "FA"
    },
    "FA2.5": {
      "id": "FA2.5",
      "title": "Das Gerät versendet die Daten an die App.",
      "file": "embedded/src/components/ble_streamer/architecture.md",
      "line": 19,
      "links": [],
      "type": "FA"
    },
    "FA2.6": {
      "id": "FA2.6",
      "title": "Das Gerät ist in einem Gehäuse.",
      "file": "embedded/src/components/gehause/architecture.md",
      "line": 19,
      "links": [],
      "type": "FA"
    },
    "FA2.6.1": {
      "id": "FA2.6.1",
      "title": "Schutz der Elektronik vor äußeren Einflüssen.",
      "file": "embedded/src/components/gehause/architecture.md",
      "line": 20,
      "links": [],
      "type": "FA"
    },
    "FA2.6.2": {
      "id": "FA2.6.2",
      "title": "Befestigungsmöglichkeit (z.B. Sportarmband) für stabile Fixierung während des Trainings.",
      "file": "embedded/src/components/gehause/architecture.md",
      "line": 21,
      "links": [],
      "type": "FA"
    },
    "FA2.2.1": {
      "id": "FA2.2.1",
      "title": "Das Gerät erkennt einen Idle Modus",
      "file": "doc/AI_DOCUMENTATION_GUIDE.md",
      "line": 136,
      "links": [],
      "type": "FA"
    },
    "FA2.2.2": {
      "id": "FA2.2.2",
      "title": "Das Gerät erkennt einen Curl",
      "file": "doc/AI_DOCUMENTATION_GUIDE.md",
      "line": 137,
      "links": [],
      "type": "FA"
    },
    "FA2.2.3": {
      "id": "FA2.2.3",
      "title": "Das Gerät erkennt einen shoulder press",
      "file": "doc/AI_DOCUMENTATION_GUIDE.md",
      "line": 138,
      "links": [],
      "type": "FA"
    },
    "FA2.2.4": {
      "id": "FA2.2.4",
      "title": "Das Gerät erkennt einen Lateral raise",
      "file": "doc/AI_DOCUMENTATION_GUIDE.md",
      "line": 139,
      "links": [],
      "type": "FA"
    },
    "FA2.2.5": {
      "id": "FA2.2.5",
      "title": "Das Gerät erkennt eine tricep extension",
      "file": "doc/AI_DOCUMENTATION_GUIDE.md",
      "line": 140,
      "links": [],
      "type": "FA"
    },
    "FA2.1.1": {
      "id": "FA2.1.1",
      "title": "Beschleunigung wird eingelesen",
      "file": "embedded/src/components/sensordatenerfassung/architecture.md",
      "line": 21,
      "links": [],
      "type": "FA"
    },
    "FA2.1.2": {
      "id": "FA2.1.2",
      "title": "Drehung wird eingelesen",
      "file": "embedded/src/components/sensordatenerfassung/architecture.md",
      "line": 22,
      "links": [],
      "type": "FA"
    },
    "FA2.4.1": {
      "id": "FA2.4.1",
      "title": "Ansteuerung der RGB-LED zur Signalisierung von Fehlern (Rot), perfekten Curls (Grün), Seitheben (Türkis), Schulterdrücken (Lila) und Idle/Verbindungsaufbau (Blau).",
      "file": "embedded/src/components/led_display_controller/architecture.md",
      "line": 35,
      "links": [],
      "type": "FA"
    },
    "FA2.5.1": {
      "id": "FA2.5.1",
      "title": "Aufbau und Aufrechterhaltung einer stabilen Bluetooth LE Verbindung.",
      "file": "embedded/src/components/ble_streamer/architecture.md",
      "line": 20,
      "links": [],
      "type": "FA"
    },
    "FA2.5.2": {
      "id": "FA2.5.2",
      "title": "Serialisierung und Übertragung der Sensordaten mit minimalem Overhead.",
      "file": "embedded/src/components/ble_streamer/architecture.md",
      "line": 21,
      "links": [],
      "type": "FA"
    },
    "FA3.1": {
      "id": "FA3.1",
      "title": "Das System speichert und verifiziert Benutzerprofile und Anmeldeinformationen persistent.",
      "file": "database/architecture.md",
      "line": 21,
      "links": [],
      "type": "FA"
    },
    "FA3.2": {
      "id": "FA3.2",
      "title": "Das System speichert aufgezeichnete Trainingseinheiten (Übungstyp, Wiederholungen, Qualität) persistent zur historischen Auswertung.",
      "file": "database/architecture.md",
      "line": 22,
      "links": [],
      "type": "FA"
    },
    "FA1.1": {
      "id": "FA1.1",
      "title": "Die App bietet eine Navigationsstruktur (Reiter/Menü) für Hardwaregeräte, Trainings und vergangene Einheiten.",
      "file": "app/components/side_nav/architecture.md",
      "line": 19,
      "links": [],
      "type": "FA"
    },
    "FA1.1.1": {
      "id": "FA1.1.1",
      "title": "Die App bietet eine Seiten-Navigation (Drawer/SideNav) auf Tablets und Web.",
      "file": "app/components/side_nav/architecture.md",
      "line": 20,
      "links": [],
      "type": "FA"
    },
    "FA1.1.2": {
      "id": "FA1.1.2",
      "title": "Die App bietet eine untere Tableiste (Tabs) auf Mobiltelefonen.",
      "file": "app/architecture.md",
      "line": 25,
      "links": [],
      "type": "FA"
    },
    "FA1.2": {
      "id": "FA1.2",
      "title": "Die App ermöglicht das Scannen nach verfügbaren Bluetooth-Sensorgeräten.",
      "file": "app/components/sensor_card/architecture.md",
      "line": 19,
      "links": [],
      "type": "FA"
    },
    "FA1.3": {
      "id": "FA1.3",
      "title": "Die App baut eine stabile Bluetooth-Verbindung zum Sensor auf.",
      "file": "app/components/sensor_card/architecture.md",
      "line": 20,
      "links": [],
      "type": "FA"
    },
    "FA1.4": {
      "id": "FA1.4",
      "title": "Die App demonstriert grafisch die auszuführende Übungsausführung (z. B. via Lottie-Animation).",
      "file": "app/architecture.md",
      "line": 28,
      "links": [],
      "type": "FA"
    },
    "FA1.5": {
      "id": "FA1.5",
      "title": "Die App visualisiert die empfangenen Sensordaten und den Übungsfortschritt in Echtzeit.",
      "file": "app/components/live_chart/architecture.md",
      "line": 19,
      "links": [],
      "type": "FA"
    },
    "FA1.6": {
      "id": "FA1.6",
      "title": "Die App zeigt historische Trainingseinheiten grafisch und statistisch an.",
      "file": "app/components/session_card/architecture.md",
      "line": 19,
      "links": [],
      "type": "FA"
    },
    "FA1.7": {
      "id": "FA1.7",
      "title": "Die App zeigt Profildetails des Benutzers an.",
      "file": "app/architecture.md",
      "line": 31,
      "links": [],
      "type": "FA"
    },
    "NF3": {
      "id": "NF3",
      "title": "Benutzbarkeit (Usability) Das Bluetooth-Pairing mit dem Sensor darf maximal zwei manuelle Interaktionen erfordern.",
      "file": "doc/Requirements.md",
      "line": 25,
      "links": [],
      "type": "NF"
    },
    "NF1": {
      "id": "NF1",
      "title": "Latenz Die End-to-End-Latenz von der physischen Sensorbewegung bis zur visuellen Darstellung in der App muss ≤ 100 ms sein.",
      "file": "doc/Requirements.md",
      "line": 19,
      "links": [],
      "type": "NF"
    },
    "UC-1": {
      "id": "UC-1",
      "title": "Trainingsgerät verbinden",
      "file": "doc/UseCases.md",
      "line": 7,
      "links": [],
      "type": "UC"
    },
    "UC-2": {
      "id": "UC-2",
      "title": "Echtzeit-Training überwachen",
      "file": "doc/UseCases.md",
      "line": 21,
      "links": [],
      "type": "UC"
    },
    "UC-3": {
      "id": "UC-3",
      "title": "Trainingsdaten einsehen",
      "file": "doc/UseCases.md",
      "line": 37,
      "links": [],
      "type": "UC"
    },
    "FA1": {
      "id": "FA1",
      "title": "Es wird eine Applikation angeboten, welche als Input für die Steuerung für den Benutzer dient. (UC-1, UC-2, UC-3)",
      "file": "doc/Requirements.md",
      "line": 9,
      "links": [
        "UC-1",
        "UC-2",
        "UC-3"
      ],
      "type": "FA"
    },
    "FA2": {
      "id": "FA2",
      "title": "Zu dem System wird ein Trainingsgerät benötigt, welche als Input für der Bewegungen des Benutzers dient. Dieses Gerät gibt die Sensorwerte als auch die Art der Bewegung zurück. (UC-1, UC-2)",
      "file": "doc/Requirements.md",
      "line": 11,
      "links": [
        "UC-1",
        "UC-2"
      ],
      "type": "FA"
    },
    "FA3": {
      "id": "FA3",
      "title": "BLE Verbindungsaufbau (UC-1)** Das System muss eine Bluetooth Low Energy Verbindung zum Sensor herstellen. ```",
      "file": "doc/AI_DOCUMENTATION_GUIDE.md",
      "line": 37,
      "links": [
        "UC-1"
      ],
      "type": "FA"
    },
    "NF2": {
      "id": "NF2",
      "title": "Zuverlässigkeit und Reconnect Bei Verbindungsabbrüchen muss die App den Nutzer umgehend benachrichtigen und automatische Wiederverbindungsversuche (Reconnect) starten.",
      "file": "doc/Requirements.md",
      "line": 22,
      "links": [],
      "type": "NF"
    },
    "R1": {
      "id": "R1",
      "title": "Plattform-Kompatibilität Die mobile Applikation muss nativ oder als hybride App auf Android-Geräten lauffähig sein.",
      "file": "doc/Requirements.md",
      "line": 32,
      "links": [],
      "type": "R"
    }
  },
  "references": {
    "FA2.1": [
      {
        "file": "embedded/src/main.cpp",
        "line": 2,
        "context": "* @implements FA2.1, FA2.2, FA2.3, FA2.4, FA2.5, NF1"
      },
      {
        "file": "embedded/src/components/sensordatenerfassung/IMUReader.cpp",
        "line": 1,
        "context": "// @implements FA2.1, NF1"
      },
      {
        "file": "embedded/src/components/sensordatenerfassung/IMUReader.cpp",
        "line": 15,
        "context": "// @implements FA2.1, NF1"
      },
      {
        "file": "embedded/src/components/sensordatenerfassung/IMUReader.cpp",
        "line": 20,
        "context": "// @implements FA2.1, NF1"
      },
      {
        "file": "embedded/src/components/sensordatenerfassung/IMUReader.cpp",
        "line": 24,
        "context": "// @implements FA2.1"
      },
      {
        "file": "embedded/src/components/sensordatenerfassung/IMUReader.cpp",
        "line": 30,
        "context": "// @implements FA2.1"
      },
      {
        "file": "embedded/src/components/sensordatenerfassung/IMUReader.h",
        "line": 6,
        "context": "// @implements FA2.1, NF1"
      },
      {
        "file": "embedded/src/components/sensordatenerfassung/IMUReader.h",
        "line": 9,
        "context": "// @implements FA2.1, NF1"
      },
      {
        "file": "embedded/architecture.md",
        "line": 22,
        "context": "**FA2.1**: Das Gerät sammelt die Dreh- und Beschleunigungsdaten des Trainierenden."
      },
      {
        "file": "embedded/architecture.md",
        "line": 31,
        "context": "**FA2.1** -> **[Sensordatenerfassung (Loop)](file:///home/arch/repo/movelink/embedded/src/components/sensordatenerfassung/architecture.md)**: Liest kontinuierlich Beschleunigung (X, Y, Z) und Gyroskop (X, Y, Z)."
      },
      {
        "file": "embedded/src/components/sensordatenerfassung/architecture.md",
        "line": 4,
        "context": "fullfills: FA2.1"
      }
    ],
    "FA2.2": [
      {
        "file": "embedded/src/main.cpp",
        "line": 2,
        "context": "* @implements FA2.1, FA2.2, FA2.3, FA2.4, FA2.5, NF1"
      },
      {
        "file": "embedded/src/components/inferenz_engine/InferenceEngine_impl.h",
        "line": 5,
        "context": "// @implements FA2.2, FA2.3"
      },
      {
        "file": "embedded/src/components/inferenz_engine/InferenceEngine.h",
        "line": 6,
        "context": "// @implements FA2.2, FA2.3"
      },
      {
        "file": "embedded/architecture.md",
        "line": 23,
        "context": "**FA2.2**: Das Gerät erkennt, was für eine Bewegung ausgeührt worden ist."
      },
      {
        "file": "embedded/architecture.md",
        "line": 32,
        "context": "**FA2.2, FA2.3** -> **[Inferenz-Engine (Edge Impulse)](file:///home/arch/repo/movelink/embedded/src/components/inferenz_engine/architecture.md)**: Klassifiziert Übungsausführungen lokal auf dem Chip."
      },
      {
        "file": "embedded/src/components/inferenz_engine/architecture.md",
        "line": 19,
        "context": "**FA2.2**: Das Gerät erkennt, was für eine Bewegung ausgeführt worden ist."
      }
    ],
    "FA2.3": [
      {
        "file": "embedded/src/main.cpp",
        "line": 2,
        "context": "* @implements FA2.1, FA2.2, FA2.3, FA2.4, FA2.5, NF1"
      },
      {
        "file": "embedded/src/components/inferenz_engine/InferenceEngine_impl.h",
        "line": 5,
        "context": "// @implements FA2.2, FA2.3"
      },
      {
        "file": "embedded/src/components/inferenz_engine/InferenceEngine.h",
        "line": 6,
        "context": "// @implements FA2.2, FA2.3"
      },
      {
        "file": "embedded/architecture.md",
        "line": 24,
        "context": "**FA2.3**: Das Gerät bewertet die Ausführung der Bewegung."
      },
      {
        "file": "embedded/architecture.md",
        "line": 32,
        "context": "**FA2.2, FA2.3** -> **[Inferenz-Engine (Edge Impulse)](file:///home/arch/repo/movelink/embedded/src/components/inferenz_engine/architecture.md)**: Klassifiziert Übungsausführungen lokal auf dem Chip."
      },
      {
        "file": "embedded/src/components/inferenz_engine/architecture.md",
        "line": 20,
        "context": "**FA2.3**: Das Gerät bewertet die Ausführung der Bewegung."
      }
    ],
    "FA2.4": [
      {
        "file": "embedded/src/main.cpp",
        "line": 2,
        "context": "* @implements FA2.1, FA2.2, FA2.3, FA2.4, FA2.5, NF1"
      },
      {
        "file": "embedded/src/components/led_display_controller/VisualFeedback.cpp",
        "line": 1,
        "context": "// @implements FA2.4"
      },
      {
        "file": "embedded/src/components/led_display_controller/VisualFeedback.cpp",
        "line": 28,
        "context": "// @implements FA2.4"
      },
      {
        "file": "embedded/src/components/led_display_controller/VisualFeedback.cpp",
        "line": 42,
        "context": "// @implements FA2.4"
      },
      {
        "file": "embedded/src/components/led_display_controller/VisualFeedback.cpp",
        "line": 48,
        "context": "// @implements FA2.4"
      },
      {
        "file": "embedded/src/components/led_display_controller/VisualFeedback.cpp",
        "line": 117,
        "context": "// @implements FA2.4"
      },
      {
        "file": "embedded/src/components/led_display_controller/VisualFeedback.h",
        "line": 6,
        "context": "// @implements FA2.4"
      },
      {
        "file": "embedded/src/components/led_display_controller/VisualFeedback.h",
        "line": 9,
        "context": "// @implements FA2.4"
      },
      {
        "file": "embedded/src/components/led_display_controller/VisualFeedback.h",
        "line": 12,
        "context": "// @implements FA2.4"
      },
      {
        "file": "embedded/src/components/led_display_controller/VisualFeedback.h",
        "line": 15,
        "context": "// @implements FA2.4"
      },
      {
        "file": "embedded/architecture.md",
        "line": 25,
        "context": "**FA2.4**: Das Gerät gibt durch die LED den Verbindungsstatus aus."
      },
      {
        "file": "embedded/architecture.md",
        "line": 33,
        "context": "**FA2.4** -> **[LED- & Display-Controller](file:///home/arch/repo/movelink/embedded/src/components/led_display_controller/architecture.md)**: Bietet direktes visuelles Feedback an den Nutzer bei Fehlern über RGB-LEDs."
      },
      {
        "file": "embedded/src/components/led_display_controller/architecture.md",
        "line": 4,
        "context": "fullfills: FA2.4"
      }
    ],
    "FA2.5": [
      {
        "file": "embedded/src/main.cpp",
        "line": 2,
        "context": "* @implements FA2.1, FA2.2, FA2.3, FA2.4, FA2.5, NF1"
      },
      {
        "file": "embedded/src/components/ble_streamer/BLEStreamer.cpp",
        "line": 1,
        "context": "// @implements FA2.5"
      },
      {
        "file": "embedded/src/components/ble_streamer/BLEStreamer.h",
        "line": 6,
        "context": "// @implements FA2.5"
      },
      {
        "file": "embedded/src/components/ble_streamer/BLEStreamer.h",
        "line": 9,
        "context": "// @implements FA2.5"
      },
      {
        "file": "embedded/architecture.md",
        "line": 26,
        "context": "**FA2.5**: Das Gerät versendet die Daten an die App."
      },
      {
        "file": "embedded/architecture.md",
        "line": 34,
        "context": "**FA2.5** -> **[BLE-Streamer](file:///home/arch/repo/movelink/embedded/src/components/ble_streamer/architecture.md)**: Überträgt die erfassten Daten an den App-Container."
      }
    ],
    "FA2.6": [
      {
        "file": "embedded/architecture.md",
        "line": 27,
        "context": "**FA2.6**: Das Gerät ist in einem Gehäuse."
      },
      {
        "file": "embedded/architecture.md",
        "line": 35,
        "context": "**FA2.6** -> **[Gehäuse](file:///home/arch/repo/movelink/embedded/src/components/gehause/architecture.md)**: Bietet physischen Schutz, sodass das Tragen erleichtert wird."
      }
    ],
    "FA2.6.1": [],
    "FA2.6.2": [],
    "FA2.2.1": [
      {
        "file": "embedded/src/components/inferenz_engine/architecture.md",
        "line": 22,
        "context": "**FA2.2.1**: Das Gerät erkennt einen Idle Modus"
      }
    ],
    "FA2.2.2": [
      {
        "file": "embedded/src/components/inferenz_engine/architecture.md",
        "line": 23,
        "context": "**FA2.2.2**: Das Gerät erkennt einen Curl"
      }
    ],
    "FA2.2.3": [
      {
        "file": "embedded/src/components/inferenz_engine/architecture.md",
        "line": 24,
        "context": "**FA2.2.3**: Das Gerät erkennt einen shoulder press"
      }
    ],
    "FA2.2.4": [
      {
        "file": "embedded/src/components/inferenz_engine/architecture.md",
        "line": 25,
        "context": "**FA2.2.4**: Das Gerät erkennt einen Lateral raise"
      }
    ],
    "FA2.2.5": [
      {
        "file": "embedded/src/components/inferenz_engine/architecture.md",
        "line": 26,
        "context": "**FA2.2.5**: Das Gerät erkennt eine tricep extension"
      }
    ],
    "FA2.1.1": [],
    "FA2.1.2": [],
    "FA2.4.1": [],
    "FA2.5.1": [],
    "FA2.5.2": [],
    "FA3.1": [
      {
        "file": "database/architecture.md",
        "line": 26,
        "context": "1. **ProfileController / Auth Service**: Authentifiziert Benutzer und liefert Profildaten. (Erfüllt: FA3.1)"
      }
    ],
    "FA3.2": [
      {
        "file": "database/architecture.md",
        "line": 27,
        "context": "2. **Trainings-DB / Session Store**: Speichert und indiziert abgeschlossene Repetitions- und Sessiondaten. (Erfüllt: FA3.2)"
      }
    ],
    "FA1.1": [
      {
        "file": "app/app/(tabs)/index.tsx",
        "line": 2,
        "context": "* @implements FA1.1, FA1.4, FA1.5"
      },
      {
        "file": "app/app/(tabs)/_layout.tsx",
        "line": 2,
        "context": "* @implements FA1.1"
      },
      {
        "file": "app/architecture.md",
        "line": 23,
        "context": "**FA1.1**: Die App bietet eine Navigationsstruktur (Reiter/Menü) für Hardwaregeräte, Trainings und vergangene Einheiten."
      },
      {
        "file": "app/architecture.md",
        "line": 36,
        "context": "1. **[SideNav](file:///home/arch/repo/movelink/app/components/side_nav/SideNav.tsx)**: Navigationskomponente für die App-Steuerung. (Erfüllt: FA1.1, FA1.1.1)"
      }
    ],
    "FA1.1.1": [
      {
        "file": "app/architecture.md",
        "line": 24,
        "context": "**FA1.1.1**: Die App bietet eine Seiten-Navigation (Drawer/SideNav) auf Tablets und Web."
      },
      {
        "file": "app/architecture.md",
        "line": 36,
        "context": "1. **[SideNav](file:///home/arch/repo/movelink/app/components/side_nav/SideNav.tsx)**: Navigationskomponente für die App-Steuerung. (Erfüllt: FA1.1, FA1.1.1)"
      }
    ],
    "FA1.1.2": [],
    "FA1.2": [
      {
        "file": "app/components/sensor_card/SensorCard.tsx",
        "line": 2,
        "context": "* @implements FA1.2, FA1.3, NF3"
      },
      {
        "file": "app/architecture.md",
        "line": 26,
        "context": "**FA1.2**: Die App ermöglicht das Scannen nach verfügbaren Bluetooth-Sensorgeräten."
      },
      {
        "file": "app/architecture.md",
        "line": 37,
        "context": "2. **[SensorCard](file:///home/arch/repo/movelink/app/components/sensor_card/SensorCard.tsx)**: Verwaltung der BLE-Geräteverbindung und Pairing. (Erfüllt: FA1.2, FA1.3, NF3)"
      }
    ],
    "FA1.3": [
      {
        "file": "app/components/sensor_card/SensorCard.tsx",
        "line": 2,
        "context": "* @implements FA1.2, FA1.3, NF3"
      },
      {
        "file": "app/hooks/useBLE.ts",
        "line": 2,
        "context": "* @implements FA1.3, FA1.5, NF2"
      },
      {
        "file": "app/architecture.md",
        "line": 27,
        "context": "**FA1.3**: Die App baut eine stabile Bluetooth-Verbindung zum Sensor auf."
      },
      {
        "file": "app/architecture.md",
        "line": 37,
        "context": "2. **[SensorCard](file:///home/arch/repo/movelink/app/components/sensor_card/SensorCard.tsx)**: Verwaltung der BLE-Geräteverbindung und Pairing. (Erfüllt: FA1.2, FA1.3, NF3)"
      },
      {
        "file": "app/architecture.md",
        "line": 40,
        "context": "5. **[BLE-Hook (useBLE)](file:///home/arch/repo/movelink/app/hooks/useBLE.ts)**: Kapselt die Bluetooth-Gerätekommunikation und den Reconnect. (Erfüllt: FA1.3, NF2)"
      }
    ],
    "FA1.4": [
      {
        "file": "app/components/ExerciseDemo.tsx",
        "line": 2,
        "context": "* @implements FA1.4"
      },
      {
        "file": "app/app/(tabs)/index.tsx",
        "line": 2,
        "context": "* @implements FA1.1, FA1.4, FA1.5"
      }
    ],
    "FA1.5": [
      {
        "file": "app/components/live_chart/LiveChart.tsx",
        "line": 2,
        "context": "* @implements FA1.5"
      },
      {
        "file": "app/app/(tabs)/index.tsx",
        "line": 2,
        "context": "* @implements FA1.1, FA1.4, FA1.5"
      },
      {
        "file": "app/store/index.ts",
        "line": 2,
        "context": "* @implements FA1.5, FA1.6"
      },
      {
        "file": "app/hooks/useBLE.ts",
        "line": 2,
        "context": "* @implements FA1.3, FA1.5, NF2"
      },
      {
        "file": "app/hooks/useWebSocket.ts",
        "line": 2,
        "context": "* @implements FA1.5"
      },
      {
        "file": "app/architecture.md",
        "line": 29,
        "context": "**FA1.5**: Die App visualisiert die empfangenen Sensordaten und den Übungsfortschritt in Echtzeit."
      },
      {
        "file": "app/architecture.md",
        "line": 38,
        "context": "3. **[LiveChart](file:///home/arch/repo/movelink/app/components/live_chart/LiveChart.tsx)**: Echtzeit-Visualisierung der IMU-Beschleunigungs- und Gyroskopwerte. (Erfüllt: FA1.5)"
      }
    ],
    "FA1.6": [
      {
        "file": "app/components/session_card/SessionCard.tsx",
        "line": 2,
        "context": "* @implements FA1.6"
      },
      {
        "file": "app/app/(tabs)/history.tsx",
        "line": 2,
        "context": "* @implements FA1.6, FA1.7"
      },
      {
        "file": "app/store/index.ts",
        "line": 2,
        "context": "* @implements FA1.5, FA1.6"
      },
      {
        "file": "app/architecture.md",
        "line": 30,
        "context": "**FA1.6**: Die App zeigt historische Trainingseinheiten grafisch und statistisch an."
      },
      {
        "file": "app/architecture.md",
        "line": 39,
        "context": "4. **[SessionCard](file:///home/arch/repo/movelink/app/components/session_card/SessionCard.tsx)**: Visualisierung historischer Trainingseinheiten. (Erfüllt: FA1.6)"
      }
    ],
    "FA1.7": [
      {
        "file": "app/app/(tabs)/history.tsx",
        "line": 2,
        "context": "* @implements FA1.6, FA1.7"
      },
      {
        "file": "app/architecture.md",
        "line": 41,
        "context": "6. **[ProfileCard](file:///home/arch/repo/movelink/app/components/ProfileCard/architecture.md)**: Visualisierung der Benutzerprofildetails. (Erfüllt: FA1.7)"
      }
    ],
    "NF3": [
      {
        "file": "app/components/sensor_card/SensorCard.tsx",
        "line": 2,
        "context": "* @implements FA1.2, FA1.3, NF3"
      },
      {
        "file": "app/architecture.md",
        "line": 37,
        "context": "2. **[SensorCard](file:///home/arch/repo/movelink/app/components/sensor_card/SensorCard.tsx)**: Verwaltung der BLE-Geräteverbindung und Pairing. (Erfüllt: FA1.2, FA1.3, NF3)"
      },
      {
        "file": "app/components/sensor_card/architecture.md",
        "line": 21,
        "context": "**NF3**: Das Bluetooth-Pairing mit dem Sensor darf maximal zwei manuelle Interaktionen erfordern."
      }
    ],
    "NF1": [
      {
        "file": "embedded/src/main.cpp",
        "line": 2,
        "context": "* @implements FA2.1, FA2.2, FA2.3, FA2.4, FA2.5, NF1"
      },
      {
        "file": "embedded/src/components/sensordatenerfassung/IMUReader.cpp",
        "line": 1,
        "context": "// @implements FA2.1, NF1"
      },
      {
        "file": "embedded/src/components/sensordatenerfassung/IMUReader.cpp",
        "line": 15,
        "context": "// @implements FA2.1, NF1"
      },
      {
        "file": "embedded/src/components/sensordatenerfassung/IMUReader.cpp",
        "line": 20,
        "context": "// @implements FA2.1, NF1"
      },
      {
        "file": "embedded/src/components/sensordatenerfassung/IMUReader.h",
        "line": 6,
        "context": "// @implements FA2.1, NF1"
      },
      {
        "file": "embedded/src/components/sensordatenerfassung/IMUReader.h",
        "line": 9,
        "context": "// @implements FA2.1, NF1"
      },
      {
        "file": "embedded/architecture.md",
        "line": 72,
        "context": "- **Lokale Auswertung vs. Cloud-Streaming**: Das Ausführen der Inferenz-Engine direkt auf dem Xiao-Controller minimiert die Latenz (NF1) und spart Bandbreite bei der Funkübertragung."
      },
      {
        "file": "app/components/live_chart/architecture.md",
        "line": 15,
        "context": "Die LiveChart visualisiert den Kurvenverlauf der Beschleunigung (X, Y, Z) und optional des Gyroskops (X, Y, Z) in Echtzeit. Sie erhält kontinuierlich Updates vom BLE-Datenstrom und zeichnet diese flüssig als SVG-Pfade, um eine Latenz unterhalb der Akzeptanzgrenze (NF1) zu garantieren."
      },
      {
        "file": "app/components/live_chart/architecture.md",
        "line": 20,
        "context": "**NF1**: Die End-to-End-Latenz von der physischen Sensorbewegung bis zur visuellen Darstellung in der App muss ≤ 100 ms sein."
      },
      {
        "file": "doc/AI_DOCUMENTATION_GUIDE.md",
        "line": 17,
        "context": "* **`NF-X`**: Nicht-funktionale Anforderungen (z. B. `NF1`)"
      },
      {
        "file": "doc/AI_DOCUMENTATION_GUIDE.md",
        "line": 65,
        "context": "* @implements FA5, NF1"
      }
    ],
    "UC-1": [
      {
        "file": "doc/Requirements.md",
        "line": 9,
        "context": "**FA1**: Es wird eine Applikation angeboten, welche als Input für die Steuerung für den Benutzer dient. (UC-1, UC-2, UC-3)"
      },
      {
        "file": "doc/Requirements.md",
        "line": 11,
        "context": "**FA2**: Zu dem System wird ein Trainingsgerät benötigt, welche als Input für der Bewegungen des Benutzers dient. Dieses Gerät gibt die Sensorwerte als auch die Art der Bewegung zurück. (UC-1, UC-2)"
      },
      {
        "file": "doc/Requirements.md",
        "line": 13,
        "context": "**FA3**: Es wird eine Datenbank benötigt, welche die Daten des Benutzers speichert. (UC-1, UC-3)"
      },
      {
        "file": "doc/AI_DOCUMENTATION_GUIDE.md",
        "line": 15,
        "context": "* **`UC-X`**: Use Cases (z. B. `UC-1`)"
      },
      {
        "file": "doc/AI_DOCUMENTATION_GUIDE.md",
        "line": 34,
        "context": "Um Anforderungen mit Use Cases zu verknüpfen, muss die Use-Case-ID in Klammern oder als Text in der Zeile der Anforderung stehen. Der Scraper sucht nach Querverweisen (z. B. `(UC-1)`):"
      },
      {
        "file": "doc/AI_DOCUMENTATION_GUIDE.md",
        "line": 37,
        "context": "**FA3: BLE Verbindungsaufbau (UC-1)**"
      }
    ],
    "UC-2": [
      {
        "file": "doc/Requirements.md",
        "line": 9,
        "context": "**FA1**: Es wird eine Applikation angeboten, welche als Input für die Steuerung für den Benutzer dient. (UC-1, UC-2, UC-3)"
      },
      {
        "file": "doc/Requirements.md",
        "line": 11,
        "context": "**FA2**: Zu dem System wird ein Trainingsgerät benötigt, welche als Input für der Bewegungen des Benutzers dient. Dieses Gerät gibt die Sensorwerte als auch die Art der Bewegung zurück. (UC-1, UC-2)"
      }
    ],
    "UC-3": [
      {
        "file": "doc/Requirements.md",
        "line": 9,
        "context": "**FA1**: Es wird eine Applikation angeboten, welche als Input für die Steuerung für den Benutzer dient. (UC-1, UC-2, UC-3)"
      },
      {
        "file": "doc/Requirements.md",
        "line": 13,
        "context": "**FA3**: Es wird eine Datenbank benötigt, welche die Daten des Benutzers speichert. (UC-1, UC-3)"
      }
    ],
    "FA1": [
      {
        "file": "doc/AI_DOCUMENTATION_GUIDE.md",
        "line": 16,
        "context": "* **`FA-X`**: Funktionale Anforderungen (z. B. `FA1`)"
      }
    ],
    "FA2": [
      {
        "file": "embedded/architecture.md",
        "line": 7,
        "context": "# FA2"
      },
      {
        "file": "doc/AI_DOCUMENTATION_GUIDE.md",
        "line": 56,
        "context": "// @implements FA2, FA3, NF2"
      }
    ],
    "FA3": [
      {
        "file": "doc/Requirements.md",
        "line": 13,
        "context": "**FA3**: Es wird eine Datenbank benötigt, welche die Daten des Benutzers speichert. (UC-1, UC-3)"
      },
      {
        "file": "doc/AI_DOCUMENTATION_GUIDE.md",
        "line": 56,
        "context": "// @implements FA2, FA3, NF2"
      }
    ],
    "NF2": [
      {
        "file": "app/hooks/useBLE.ts",
        "line": 2,
        "context": "* @implements FA1.3, FA1.5, NF2"
      },
      {
        "file": "app/architecture.md",
        "line": 40,
        "context": "5. **[BLE-Hook (useBLE)](file:///home/arch/repo/movelink/app/hooks/useBLE.ts)**: Kapselt die Bluetooth-Gerätekommunikation und den Reconnect. (Erfüllt: FA1.3, NF2)"
      },
      {
        "file": "doc/AI_DOCUMENTATION_GUIDE.md",
        "line": 56,
        "context": "// @implements FA2, FA3, NF2"
      }
    ],
    "R1": [
      {
        "file": "embedded/.pio/libdeps/seeed_xiao_nrf52840_sense/ArduinoBLE/README.md",
        "line": 5,
        "context": "Enables Bluetooth® Low Energy connectivity on the Arduino MKR WiFi 1010, Arduino UNO WiFi Rev.2, Arduino Nano 33 IoT, Arduino Nano 33 BLE, Arduino Portenta H7, Arduino Giga R1 and Arduino UNO R4 WiFi."
      },
      {
        "file": "embedded/.pio/libdeps/xiaoblesense/ArduinoBLE/README.md",
        "line": 5,
        "context": "Enables Bluetooth® Low Energy connectivity on the Arduino MKR WiFi 1010, Arduino UNO WiFi Rev.2, Arduino Nano 33 IoT, Arduino Nano 33 BLE, Arduino Portenta H7, Arduino Giga R1 and Arduino UNO R4 WiFi."
      },
      {
        "file": "doc/AI_DOCUMENTATION_GUIDE.md",
        "line": 18,
        "context": "* **`R-X`**: Randbedingungen (z. B. `R1`)"
      }
    ]
  },
  "codeContents": {
    "embedded/src/components/inferenz_engine/architecture.md": "<!--\nC4-Ebene: Component\nDeployable: Nein\n-->\n\n# Inferenz-Engine (Edge Impulse)\n\nDiese Komponente klassifiziert Übungsausführungen in Echtzeit direkt auf dem Mikrocontroller (Edge Computing).\n\n## C4-Architektur-Ebene\n* **C4-Ebene:** Component\n* **Deployable:** Nein (Läuft als Teil des Sensor Firmware Containers)\n\n## Beschreibung\nDie Inferenz-Engine führt ein CNN-Klassifikationsmodell aus, das über Edge Impulse trainiert und als Arduino-Bibliothek in die Firmware integriert wurde. Es analysiert die 6-Achsen-Bewegungsdaten auf spezifische Übungsqualitäten und Fehlerbilder.\n\n## Requirements\n\n**FA2.2**: Das Gerät erkennt, was für eine Bewegung ausgeführt worden ist.\n**FA2.3**: Das Gerät bewertet die Ausführung der Bewegung.\n\n**FA2.2.1**: Das Gerät erkennt einen Idle Modus\n**FA2.2.2**: Das Gerät erkennt einen Curl\n**FA2.2.3**: Das Gerät erkennt einen shoulder press\n**FA2.2.4**: Das Gerät erkennt einen Lateral raise\n**FA2.2.5**: Das Gerät erkennt eine tricep extension\n\n## Datenfluss\n\n```mermaid\nflowchart TD\n    DSP[DSP Puffer (6 Achsen)] -->|run_classifier| Model[CNN Inferenzmodell]\n    Model -->|Wahrscheinlichkeiten| Eval[Klassenauswertung]\n    Eval -->|Bester Treffer + Score| Output[Feedback & PC-JSON-Stream]\n```\n\n## Technische Details\n- **Modelltyp:** Convolutional Neural Network (CNN)\n- **Erkannte Klassen:**\n  - `idle` / `Idle`: Keine Übungsausführung / Ruhezustand.\n  - `curl` / `curl_sauber` / `CURL`: Korrekt ausgeführter Bizeps-Curl.\n  - `ShoulderPress` / `shoulderpress`: Schulterdrücken.\n  - `lateralraise` / `LateralRaise` / `LateralRaises`: Seitheben.\n  - `fehler_rotation`: Fehlerhafte Ausführung des Bizeps-Curls durch Rotation des Handgelenks.\n  - `fehler_ellbogen`: Fehlerhafte Ausführung des Bizeps-Curls durch Bewegung des Ellbogens.\n- **Anomalieerkennung:** Optionaler K-Means-Clustering-Block zur Erkennung unbekannter Bewegungen.\n",
    "app/components/ExerciseDemo.tsx": "/**\n * @implements FA1.4\n */\nimport React, { useEffect } from 'react';\nimport { View, Text, StyleSheet } from 'react-native';\nimport Svg, { Line, Circle, G } from 'react-native-svg';\nimport Animated, {\n  useSharedValue,\n  useAnimatedProps,\n  withRepeat,\n  withSequence,\n  withTiming,\n} from 'react-native-reanimated';\nimport { Colors } from '@/constants/Colors';\nimport { GlassCard } from '@/components/GlassCard';\nimport { ExerciseType } from '@/store';\n\ninterface Props {\n  exercise: ExerciseType;\n  label?: string;\n}\n\nconst AnimatedLine = Animated.createAnimatedComponent(Line);\nconst AnimatedCircle = Animated.createAnimatedComponent(Circle);\n\nexport function ExerciseDemo({ exercise, label }: Props) {\n  const progress = useSharedValue(0);\n\n  useEffect(() => {\n    progress.value = 0;\n    progress.value = withRepeat(\n      withSequence(\n        withTiming(1, { duration: 1500 }), // In der Beugung verharren\n        withTiming(0, { duration: 1500 })  // Zurück zur Ausgangslage\n      ),\n      -1,\n      true\n    );\n  }, [exercise]);\n\n  // SQUAT COORDINATES INTERPOLATION\n  const squatKneeProps = useAnimatedProps(() => ({\n    x2: 130 + 25 * progress.value,\n    y2: 150 + 10 * progress.value,\n  }));\n\n  const squatThighProps = useAnimatedProps(() => {\n    const kx = 130 + 25 * progress.value;\n    const ky = 150 + 10 * progress.value;\n    return {\n      x1: kx,\n      y1: ky,\n      x2: 130 - 35 * progress.value,\n      y2: 95 + 50 * progress.value,\n    };\n  });\n\n  const squatTorsoProps = useAnimatedProps(() => {\n    const hx = 130 - 35 * progress.value;\n    const hy = 95 + 50 * progress.value;\n    return {\n      x1: hx,\n      y1: hy,\n      x2: 130 - 15 * progress.value,\n      y2: 35 + 55 * progress.value,\n    };\n  });\n\n  const squatHeadProps = useAnimatedProps(() => ({\n    cx: 130 - 15 * progress.value,\n    cy: 17 + 55 * progress.value,\n  }));\n\n  // CURL COORDINATES INTERPOLATION (Elbow fixed, forearm rotates)\n  const curlForearmProps = useAnimatedProps(() => {\n    const rad = (270 - 150 * progress.value) * (Math.PI / 180);\n    return {\n      x2: 120 + 50 * Math.cos(rad),\n      y2: 125 + 50 * Math.sin(rad),\n    };\n  });\n\n  const curlWristProps = useAnimatedProps(() => {\n    const rad = (270 - 150 * progress.value) * (Math.PI / 180);\n    return {\n      cx: 120 + 50 * Math.cos(rad),\n      cy: 125 + 50 * Math.sin(rad),\n    };\n  });\n\n  return (\n    <GlassCard style={styles.card}>\n      <Text style={styles.title}>{label || 'Ausführung demonstrieren'}</Text>\n      \n      <View style={styles.container}>\n        <Svg width=\"250\" height=\"230\" viewBox=\"0 0 250 230\">\n          {/* Ground indicator */}\n          <Line x1=\"40\" y1=\"210\" x2=\"210\" y2=\"210\" stroke={Colors.textMuted} strokeWidth={2} strokeDasharray=\"4 4\" />\n\n          {exercise === 'squat' ? (\n            <G>\n              {/* FIXED FEET / ANKLE */}\n              <Line x1=\"100\" y1=\"210\" x2=\"130\" y2=\"210\" stroke={Colors.primary} strokeWidth={6} strokeLinecap=\"round\" />\n              <Circle cx=\"130\" cy=\"210\" r=\"5\" fill={Colors.primary} />\n\n              {/* CALF (Ankle to Knee) */}\n              <AnimatedLine\n                x1={130}\n                y1={210}\n                stroke={Colors.primary}\n                strokeWidth={5}\n                strokeLinecap=\"round\"\n                animatedProps={squatKneeProps}\n              />\n              \n              {/* KNEE JOINT */}\n              <AnimatedCircle\n                r=\"4\"\n                fill={Colors.primaryLight}\n                animatedProps={useAnimatedProps(() => ({\n                  cx: 130 + 25 * progress.value,\n                  cy: 150 + 10 * progress.value,\n                }))}\n              />\n\n              {/* THIGH (Knee to Hip) */}\n              <AnimatedLine\n                stroke={Colors.primary}\n                strokeWidth={5}\n                strokeLinecap=\"round\"\n                animatedProps={squatThighProps}\n              />\n\n              {/* HIP JOINT */}\n              <AnimatedCircle\n                r=\"4\"\n                fill={Colors.primaryLight}\n                animatedProps={useAnimatedProps(() => ({\n                  cx: 130 - 35 * progress.value,\n                  cy: 95 + 50 * progress.value,\n                }))}\n              />\n\n              {/* TORSO (Hip to Shoulder) */}\n              <AnimatedLine\n                stroke={Colors.primary}\n                strokeWidth={5}\n                strokeLinecap=\"round\"\n                animatedProps={squatTorsoProps}\n              />\n\n              {/* SHOULDER JOINT */}\n              <AnimatedCircle\n                r=\"4\"\n                fill={Colors.primaryLight}\n                animatedProps={useAnimatedProps(() => ({\n                  cx: 130 - 15 * progress.value,\n                  cy: 35 + 55 * progress.value,\n                }))}\n              />\n\n              {/* HEAD */}\n              <AnimatedCircle\n                r=\"12\"\n                fill=\"transparent\"\n                stroke={Colors.primary}\n                strokeWidth={3}\n                animatedProps={squatHeadProps}\n              />\n            </G>\n          ) : (\n            <G>\n              {/* TORSO (Fixed upright body) */}\n              <Line x1=\"120\" y1=\"35\" x2=\"120\" y2=\"125\" stroke={Colors.textMuted} strokeWidth={4} strokeLinecap=\"round\" />\n              <Circle cx=\"120\" cy=\"22\" r=\"10\" fill=\"transparent\" stroke={Colors.textMuted} strokeWidth={2.5} />\n              \n              {/* UPPER ARM (Shoulder fixed to Elbow) */}\n              <Line x1=\"120\" y1=\"70\" x2=\"120\" y2=\"125\" stroke={Colors.primary} strokeWidth={5} strokeLinecap=\"round\" />\n              <Circle cx=\"120\" cy=\"70\" r=\"4\" fill={Colors.primaryLight} />\n              <Circle cx=\"120\" cy=\"125\" r=\"4\" fill={Colors.primaryLight} />\n\n              {/* FOREARM (Elbow to Wrist) */}\n              <AnimatedLine\n                x1={120}\n                y1={125}\n                stroke={Colors.primary}\n                strokeWidth={5}\n                strokeLinecap=\"round\"\n                animatedProps={curlForearmProps}\n              />\n              \n              {/* WRIST */}\n              <AnimatedCircle\n                r=\"5\"\n                fill={Colors.primaryLight}\n                animatedProps={curlWristProps}\n              />\n            </G>\n          )}\n        </Svg>\n      </View>\n    </GlassCard>\n  );\n}\n\nconst styles = StyleSheet.create({\n  card: { padding: 20, alignItems: 'center', gap: 12 },\n  title: { color: Colors.text, fontSize: 16, fontWeight: '700', letterSpacing: -0.2 },\n  container: { height: 230, width: '100%', alignItems: 'center', justifyContent: 'center' },\n});\n",
    "doc/AI_DOCUMENTATION_GUIDE.md": "# Leitfaden für KI-Dokumentation & Traceability (MoveLink)\n\nDieses Repository verwendet ein automatisiertes, integriertes Dokumentations- und Traceability-System. Es scannt Markdown-Dokumente und Quellcode-Dateien, um eine interaktive Weboberfläche (HTML Dashboard) sowie einen kompilierten PDF-Bericht zu generieren.\n\nDamit zukünftige KIs und Entwickler neue Anforderungen, Use Cases und Architekturentwicklungen richtig dokumentieren, müssen die folgenden Standards eingehalten werden.\n\n---\n\n## 1. Definition von Anforderungen & Use Cases (.md-Dateien)\n\nAlle Systemdefinitionen werden in Markdown-Dateien im Ordner `doc/` gepflegt (z. B. `doc/Requirements.md` und `doc/UseCases.md`).\n\n### ID-Format & Konventionen\nJeder Eintrag muss eine eindeutige ID besitzen:\n* **`UC-X`**: Use Cases (z. B. `UC-1`)\n* **`FA-X`**: Funktionale Anforderungen (z. B. `FA1`)\n* **`NF-X`**: Nicht-funktionale Anforderungen (z. B. `NF1`)\n* **`R-X`**: Randbedingungen (z. B. `R1`)\n\n### Format der Deklaration in Markdown\nIn den jeweiligen subdirectories befinden sich architecture.md Dateien. Diese Dateien beschreiben die Architektur der jeweiligen Komponente oder des Containers. Damit der Scraper (`scrape_docs.py`) die Einträge korrekt parsen kann, müssen sie in einer Zeile deklariert werden, gefolgt von einer Beschreibung. Der Aufbau sieht folgendermaßen aus:\n\n# <Name>\n## C4-Architektur-Ebene\n## Beschreibung\n## Requirements\n## Datenfluss\n## Abwägungen\n## Technische Details\n\ndie technischen Details sind optinal. Ein Beispiel hierfür ist am Ende des Dokuments.\n\n### Verknüpfung zwischen Anforderungen und Use Cases (Traceability)\nUm Anforderungen mit Use Cases zu verknüpfen, muss die Use-Case-ID in Klammern oder als Text in der Zeile der Anforderung stehen. Der Scraper sucht nach Querverweisen (z. B. `(UC-1)`):\n\n```markdown\n**FA3: BLE Verbindungsaufbau (UC-1)**\nDas System muss eine Bluetooth Low Energy Verbindung zum Sensor herstellen.\n```\n\n---\n\n## 2. Implementierungs-Referenzen im Quellcode (@implements)\n\nUm nachzuweisen, dass eine Anforderung tatsächlich im Code implementiert wurde, müssen Entwickler und KIs direkt in den Quellcodedateien (`.ts`, `.tsx`, `.ino`, `.cpp`, `.h`) `@implements`-Annotationen in Kommentaren hinzufügen.\n\n### Syntax\n```\n@implements ID1, ID2, ...\n```\n\n### Code-Beispiele\n\n**In TypeScript / TSX Dateien (`app/`):**\n```tsx\n// @implements FA2, FA3, NF2\nexport function SensorCard() {\n    // UI Code...\n}\n```\n\n**In Arduino / C++ Dateien (`embedded/`):**\n```cpp\n/*\n * @implements FA5, NF1\n * Liest Sensorwerte mit 50Hz aus und wendet einen Tiefpassfilter an.\n */\nvoid loop() {\n    // Sensorsignal...\n}\n```\n\n---\n\n## 3. C4-Architektur-Modellierung (Metadaten-Blöcke)\n\nJedes Architektur-Dokument in Markdown muss Informationen über die zugehörige C4-Ebene und die Deployability enthalten.\n\n### Metadaten-Header in Markdown\nFügen Sie ganz oben in der entsprechenden Architektur-Markdown-Datei (z. B. `app/architecture.md`) einen HTML-Kommentarblock mit folgenden Keys hinzu:\n\n```markdown\n<!--\nC4-Ebene: Container\nDeployable: Ja\n-->\n```\n\n**Erlaubte Werte:**\n* **C4-Ebene**: `System-Context`, `Container`, `Component`\n* **Deployable**: `Ja` / `Nein` (oder `Yes` / `No`)\n\n### Registrierung im C4 Model Explorer\nWenn ein neuer Container oder eine neue Komponente hinzugefügt wird, muss diese auch in der `C4_DATA`-Struktur am Ende von `docs_site/app.js` registriert werden:\n1. Tragen Sie das Element unter `containers.elements` oder `components.[container_id].elements` ein.\n2. Definieren Sie dessen Verbindungen (Connectoren) im zugehörigen `connections`-Array.\n3. Ergänzen Sie die Dateizuordnung in der Funktion `getC4ElementForFile` in `docs_site/app.js`, damit die E2E-Flussdiagramme die Datei dem neuen C4-Element zuweisen.\n\n---\n\n## 4. Build-Prozess & Pipeline\n\nNach jeder Änderung an der Dokumentation oder den `@implements`-Kommentaren im Quellcode müssen die Kompilierungsskripte ausgeführt werden:\n\n### Lokaler Build-Befehl\n1. **Scraper ausführen** (erstellt `docs_site/data.js`):\n   ```bash\n   python scrape_docs.py\n   ```\n2. **PDF Bericht generieren** (erstellt `docs_site/documentation_report.pdf`):\n   ```bash\n   python generate_pdf.py\n   ```\n\n### CI/CD Pipeline (GitHub Actions)\nBei jedem Push auf den `main`-Branch baut die Pipeline `.github/workflows/docs.yml` die Webseite und das PDF automatisch. Wenn Sie einen Commit pushen, der bereits kompilierte Änderungen enthält, nutzen Sie `[skip ci]` im Commit-Betreff, um endlose Build-Loops zu verhindern.\n\n\n## 5. Beispiel für eine architecture.md Datei\n# Inferenz-Engine (Edge Impulse)\n\nDiese Komponente klassifiziert Übungsausführungen in Echtzeit direkt auf dem Mikrocontroller (Edge Computing).\n\n## C4-Architektur-Ebene\n* **C4-Ebene:** Component\n* **Deployable:** Nein (Läuft als Teil des Sensor Firmware Containers)\n\n## Beschreibung\nDie Inferenz-Engine führt ein CNN-Klassifikationsmodell aus, das über Edge Impulse trainiert und als Arduino-Bibliothek in die Firmware integriert wurde. Es analysiert die 6-Achsen-Bewegungsdaten auf spezifische Übungsqualitäten und Fehlerbilder.\n\n## Requirements\n\n**FA2.2**: Das Gerät erkennt, was für eine Bewegung ausgeführt worden ist.\n**FA2.3**: Das Gerät bewertet die Ausführung der Bewegung.\n\n**FA2.2.1**: Das Gerät erkennt einen Idle Modus\n**FA2.2.2**: Das Gerät erkennt einen Curl\n**FA2.2.3**: Das Gerät erkennt einen shoulder press\n**FA2.2.4**: Das Gerät erkennt einen Lateral raise\n**FA2.2.5**: Das Gerät erkennt eine tricep extension\n\n## Datenfluss\n\n```mermaid\nflowchart TD\n    DSP[DSP Puffer (6 Achsen)] -->|run_classifier| Model[CNN Inferenzmodell]\n    Model -->|Wahrscheinlichkeiten| Eval[Klassenauswertung]\n    Eval -->|Bester Treffer + Score| Output[Feedback & PC-JSON-Stream]\n```\n\n## Abwägungen\n\nBewegungsauswertung:\nDie Bewertung\n\n| Auf dem Gerät | Komplett in der App | Hybrid |\n|----------|----------|----------|\n| + Per Edge Impulse einfach umzusetzende Inferenz    | + Genug Rechenleistung für komplexe Deep-Learning-Modelle    | + MCU filtert/komprimiert Daten; App übernimmt Inferenz    |\n| - Begrenzte Speicher- und Rechenkapazitäten der MCU    | - Hohe BLE-Datenrate (50Hz Rohdatenstrom) erforderlich    | - Höhere Systemkomplexität durch geteilte Logik    |\n| - Modell-Updates erfordern Firmware-Flashen    | - Erhöhter Akkuverbrauch auf dem Mobilgerät    | - Komplexeres Debugging bei Übertragungsverzögerungen    |\n\n\n## Technische Details\n- **Modelltyp:** Convolutional Neural Network (CNN)\n- **Erkannte Klassen:**\n  - `idle`: Keine Übungsausführung / Ruhezustand.\n  - `curl_sauber`: Korrekt ausgeführter Bizeps-Curl.\n  - `fehler_rotation`: Fehlerhafte Ausführung durch Rotation des Handgelenks.\n  - `fehler_ellbogen`: Fehlerhafte Ausführung durch Bewegung des Ellbogens.\n- **Anomalieerkennung:** Optionaler K-Means-Clustering-Block zur Erkennung unbekannter Bewegungen.\n",
    "embedded/architecture.md": "<!--\nC4-Ebene: Container\nDeployable: Ja\n-->\n\n# MoveLink Embedded Firmware - Container-Architektur\n# FA2\n\nDieses Dokument beschreibt die Embedded Sensor-Firmware als eigenständige, deploybare Einheit im C4-Modell.\n\n## C4-Architektur-Ebene\n* **C4-Ebene:** Container\n* **Deployable:** Ja\n* **Deployment-Artefakt:** Binär-Firmware (flashed via USB/Serial)\n* **Technologie-Stack:** Arduino C/C++, LSM6DS3 IMU Library, Edge Impulse SDK, Bluetooth Low Energy\n\n## Beschreibung\nDie Sensor-Firmware läuft auf dem XIAO nRF52840 Sense Controller. Sie erfasst Beschleunigungs- und Rotationsdaten über den integrierten LSM6DS3-Sensor mit einer festen Abtastrate (50Hz), wendet Signalfilterungen zur Rauschunterdrückung an und streamt die Datenpakete als binäres Array via BLE Characteristics an die Mobile App. Alternativ führt sie Edge-Impulse-Inferenzmodelle direkt auf dem Mikrocontroller aus, um Trainingsübungen (z.B. Bizeps-Curls, Schulterdrücken und Seitheben) lokal zu klassifizieren und Fehler über die integrierten RGB-LEDs anzuzeigen.\n\n## Requirements\n\n**FA2.1**: Das Gerät sammelt die Dreh- und Beschleunigungsdaten des Trainierenden.\n**FA2.2**: Das Gerät erkennt, was für eine Bewegung ausgeührt worden ist. \n**FA2.3**: Das Gerät bewertet die Ausführung der Bewegung. \n**FA2.4**: Das Gerät gibt durch die LED den Verbindungsstatus aus.\n**FA2.5**: Das Gerät versendet die Daten an die App.\n**FA2.6**: Das Gerät ist in einem Gehäuse.\n\n## Komponenten in diesem Container\nDie Sensor-Firmware besteht aus folgenden logischen Komponenten:\n**FA2.1** -> **[Sensordatenerfassung (Loop)](file:///home/arch/repo/movelink/embedded/src/components/sensordatenerfassung/architecture.md)**: Liest kontinuierlich Beschleunigung (X, Y, Z) und Gyroskop (X, Y, Z).\n**FA2.2, FA2.3** -> **[Inferenz-Engine (Edge Impulse)](file:///home/arch/repo/movelink/embedded/src/components/inferenz_engine/architecture.md)**: Klassifiziert Übungsausführungen lokal auf dem Chip.\n**FA2.4** -> **[LED- & Display-Controller](file:///home/arch/repo/movelink/embedded/src/components/led_display_controller/architecture.md)**: Bietet direktes visuelles Feedback an den Nutzer bei Fehlern über RGB-LEDs.\n**FA2.5** -> **[BLE-Streamer](file:///home/arch/repo/movelink/embedded/src/components/ble_streamer/architecture.md)**: Überträgt die erfassten Daten an den App-Container.\n**FA2.6** -> **[Gehäuse](file:///home/arch/repo/movelink/embedded/src/components/gehause/architecture.md)**: Bietet physischen Schutz, sodass das Tragen erleichtert wird.\n\n## Datenfluss\n```mermaid\nflowchart LR\n    %% Stil-Definitionen für Übersichtlichkeit\n    classDef hardware fill:#f5f5f5,stroke:#666,stroke-width:2px;\n    classDef process fill:#d1e8ff,stroke:#0066cc,stroke-width:1px;\n    classDef external fill:#ffe5d9,stroke:#cc3300,stroke-width:1px;\n\n    %% Datenquellen & Hardware\n    IMU[(\"LSM6DS3 Sensor (Hardware)\")]:::hardware\n    LED[/\"RGB-LEDs (Hardware)\"/]:::hardware\n\n    %% Interne Komponenten (Prozesse)\n    Sensation(Sensordatenerfassung):::process\n    Engine(Inferenz-Engine):::process\n    LED_Ctrl(LED- & Display-Controller):::process\n    BLE_Stream(BLE-Streamer):::process\n\n    %% Externe Senke\n    App[[MoveLink Mobile App]]:::external\n\n    %% Datenflussverbindungen mit Datenbeschriftung\n    IMU -->|\"Rohdaten (IMU X,Y,Z @ 50Hz)\"| Sensation\n    Sensation -->|\"Sensor-Daten-Array (Buffer)\"| Engine\n    \n    %% Aufspaltung nach der Inferenz\n    Engine -->|\"Klassifizierung & Bewertung\"| LED_Ctrl\n    Engine -->|\"Klassifizierung & Bewertung\"| BLE_Stream\n    \n    %% Ausgaben\n    LED_Ctrl -->|\"Steuersignal (Anzeige)\"| LED\n    BLE_Stream -->|\"Binäres Array / JSON via BLE\"| App\n```\n\n## Abwägungen\n- **Lokale Auswertung vs. Cloud-Streaming**: Das Ausführen der Inferenz-Engine direkt auf dem Xiao-Controller minimiert die Latenz (NF1) und spart Bandbreite bei der Funkübertragung.\n- **Energiebedarf**: Die kontinuierliche Sensordatenerfassung und BLE-Funkübertragung verbrauchen Energie, weshalb die Akkulaufzeit durch einen stromsparenden Betrieb im Idle und Deaktivieren nicht benötigter Hardware-Peripherie optimiert wird.\n",
    "doc/Requirements.md": "# Systemanforderungen (Requirements)\n\nDieses Dokument definiert die funktionalen und nicht-funktionalen Anforderungen sowie die Randbedingungen des MoveLink-Systems.\n\n---\n\n## Funktionale Anforderungen //Was für Instanzen existieren denn eigentlich.\n\n**FA1**: Es wird eine Applikation angeboten, welche als Input für die Steuerung für den Benutzer dient. (UC-1, UC-2, UC-3)\n\n**FA2**: Zu dem System wird ein Trainingsgerät benötigt, welche als Input für der Bewegungen des Benutzers dient. Dieses Gerät gibt die Sensorwerte als auch die Art der Bewegung zurück. (UC-1, UC-2)\n\n**FA3**: Es wird eine Datenbank benötigt, welche die Daten des Benutzers speichert. (UC-1, UC-3)\n\n---\n\n## Nicht-funktionale Anforderungen\n\n**NF1**: Latenz\nDie End-to-End-Latenz von der physischen Sensorbewegung bis zur visuellen Darstellung in der App muss ≤ 100 ms sein.\n\n**NF2**: Zuverlässigkeit und Reconnect\nBei Verbindungsabbrüchen muss die App den Nutzer umgehend benachrichtigen und automatische Wiederverbindungsversuche (Reconnect) starten.\n\n**NF3**: Benutzbarkeit (Usability)\nDas Bluetooth-Pairing mit dem Sensor darf maximal zwei manuelle Interaktionen erfordern.\n\n---\n\n## Randbedingungen\n\n**R1**: Plattform-Kompatibilität\nDie mobile Applikation muss nativ oder als hybride App auf Android-Geräten lauffähig sein.\n\n\n## Abwägungen\n\nHardware/Gerät:\n| vorgefertigtes Gerät (Fitbit) | Hybrid (XIAO seed NRF52840) | Eigene Lösung (PCB) |\n|----------|----------|----------|\n| + Klein und ausgereift    | + Kostengünstig, integrierte IMU & BLE    | + Maximale Kontrolle über Formfaktor und Sensoren    |\n| - Teuer    | - Gehäuse muss selbst konstruiert/gedruckt werden    | - Sehr hohe Entwicklungskosten und Time-to-Market    |\n| - Schlecht erweiterbar durch andere Sensoren    | - Höherer Integrationsaufwand als fertiges Konsumentenprodukt    | - Komplexes PCB-Design und Fertigungsrisiko    |\n\nEntscheidung: XIAO seed NRF52840\n\n\nApp:\n| Ionic (Flutter)  | Hybrid (React Native) | Native IOS Swift/Android Java |\n|----------|----------|----------|\n| + Schnelles Prototyping und einfache Web-Technologien    | + Hohe Code-Wiederverwendbarkeit und schnelle UI-Iterationen    | + Optimale Bluetooth-Leistung und direkter API-Zugriff    |\n| - Performance-Einbußen bei 50Hz Echtzeit-Diagrammen    | - BLE-Bibliotheken von Drittanbietern erfordern Wartung    | - Hohe Entwicklungskosten durch zwei separate Codebases    |\n| - Komplexere native Bluetooth-Anbindung über Plugins    | - Performance-Overhead durch JS-Bridge bei kontinuierlichem Datenstrom    | - Längere Time-to-Market und aufwendige doppelte Pflege    |\n\nEntscheidung: Hybrid (React Native)\n\nBewegungsauswertung:\nDie Bewertung\n\n| Auf dem Gerät | Komplett in der App | Hybrid |\n|----------|----------|----------|\n| + Per Edge Impulse einfach umzusetzende Inferenz    | + Genug Rechenleistung für komplexe Deep-Learning-Modelle    | + MCU filtert/komprimiert Daten; App übernimmt Inferenz    |\n| - Begrenzte Speicher- und Rechenkapazitäten der MCU    | - Hohe BLE-Datenrate (50Hz Rohdatenstrom) erforderlich    | - Höhere Systemkomplexität durch geteilte Logik    |\n| - Modell-Updates erfordern Firmware-Flashen    | - Erhöhter Akkuverbrauch auf dem Mobilgerät    | - Komplexeres Debugging bei Übertragungsverzögerungen    |\n\nEntscheidung: Auf dem Gerät (Edge-Inferenz)",
    "app/app/(tabs)/history.tsx": "/**\n * @implements FA1.6, FA1.7\n */\nimport React, { useEffect, useState, useMemo } from 'react';\nimport { View, Text, FlatList, StyleSheet, SafeAreaView, ActivityIndicator, StatusBar, TouchableOpacity, Modal, ScrollView } from 'react-native';\nimport { LinearGradient } from 'expo-linear-gradient';\nimport AsyncStorage from '@react-native-async-storage/async-storage';\nimport { FadeSlide } from '@/components/FadeSlide';\nimport { AnimatedLogo } from '@/components/AnimatedLogo';\nimport { GlassCard } from '@/components/GlassCard';\nimport { Colors } from '@/constants/Colors';\nimport { useTrainingStore, TrainingSession } from '@/store';\nimport { SessionCard } from '@/components/session_card/SessionCard';\nimport { formatMovementLabel, getAnomalyColor, getAnomalyLabel } from './index';\n\nconst API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';\n\nfunction formatDuration(s: number) {\n  const m = Math.floor(s / 60);\n  const sec = s % 60;\n  return `${m}:${sec.toString().padStart(2, '0')}`;\n}\n\nfunction StatsDashboard({ sessions }: { sessions: TrainingSession[] }) {\n  const totalSessions = sessions.length;\n  const totalDuration = sessions.reduce((acc, s) => acc + s.durationSeconds, 0);\n  const totalReadings = sessions.reduce((acc, s) => acc + s.readingCount, 0);\n  const avgDuration = totalSessions > 0 ? Math.round(totalDuration / totalSessions) : 0;\n\n  return (\n    <GlassCard style={styles.statsCard}>\n      <Text style={styles.statsTitle}>Aktivitäts-Auswertung</Text>\n      <View style={styles.statsGrid}>\n        <View style={styles.statBox}>\n          <Text style={styles.statBoxVal}>{totalSessions}</Text>\n          <Text style={styles.statBoxLabel}>Einheiten</Text>\n        </View>\n        <View style={styles.statBoxDivider} />\n        <View style={styles.statBox}>\n          <Text style={styles.statBoxVal}>{formatDuration(totalDuration)}</Text>\n          <Text style={styles.statBoxLabel}>Gesamtzeit</Text>\n        </View>\n        <View style={styles.statBoxDivider} />\n        <View style={styles.statBox}>\n          <Text style={styles.statBoxVal}>{formatDuration(avgDuration)}</Text>\n          <Text style={styles.statBoxLabel}>Ø Dauer</Text>\n        </View>\n      </View>\n      <View style={styles.readingsSummary}>\n        <Text style={styles.readingsText}>\n          📊 Insgesamt <Text style={styles.readingsHighlight}>{totalReadings.toLocaleString()}</Text> Sensor-Messwerte analysiert\n        </Text>\n      </View>\n    </GlassCard>\n  );\n}\n\ninterface SessionDetailModalProps {\n  session: TrainingSession | null;\n  visible: boolean;\n  onClose: () => void;\n}\n\nfunction SessionDetailModal({ session, visible, onClose }: SessionDetailModalProps) {\n  if (!session) return null;\n\n  const stats = useMemo(() => {\n    const infs = session.inferences || [];\n    if (infs.length === 0) {\n      return {\n        avgAnomaly: null,\n        exercisePercentages: [],\n        tipsList: [],\n      };\n    }\n\n    const totalAnomaly = infs.reduce((acc, i) => acc + i.anomaly, 0);\n    const avgAnomaly = totalAnomaly / infs.length;\n\n    const counts: Record<string, number> = {};\n    infs.forEach((i) => {\n      const name = formatMovementLabel(i.label);\n      counts[name] = (counts[name] || 0) + 1;\n    });\n\n    const totalInferences = infs.length;\n    const exercisePercentages = Object.entries(counts)\n      .map(([name, count]) => ({\n        name,\n        percentage: Math.round((count / totalInferences) * 100),\n      }))\n      .sort((a, b) => b.percentage - a.percentage);\n\n    const tipsMap: Record<string, number> = {};\n    infs.forEach((i) => {\n      if (i.tipp && i.tipp !== 'Bereit' && !i.tipp.includes('erkannt')) {\n        tipsMap[i.tipp] = (tipsMap[i.tipp] || 0) + 1;\n      }\n    });\n    const tipsList = Object.entries(tipsMap).map(([text, count]) => ({ text, count }));\n\n    return {\n      avgAnomaly,\n      exercisePercentages,\n      tipsList,\n    };\n  }, [session]);\n\n  const dateStr = new Date(session.startedAt).toLocaleDateString('de-DE', {\n    weekday: 'long',\n    day: '2-digit',\n    month: 'long',\n    year: 'numeric',\n  });\n  const timeStr = new Date(session.startedAt).toLocaleTimeString('de-DE', {\n    hour: '2-digit',\n    minute: '2-digit',\n  });\n\n  return (\n    <Modal visible={visible} animationType=\"slide\" transparent>\n      <View style={styles.modalOverlay}>\n        <GlassCard style={styles.modalCard}>\n          {/* Header */}\n          <View style={styles.modalHeader}>\n            <View>\n              <Text style={styles.modalTitle}>Einheits-Details</Text>\n              <Text style={styles.modalSub}>{dateStr} um {timeStr}</Text>\n            </View>\n            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>\n              <Text style={styles.closeBtnText}>✕</Text>\n            </TouchableOpacity>\n          </View>\n\n          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>\n            {/* Basic Stats Grid */}\n            <View style={styles.modalStatsGrid}>\n              <View style={styles.modalStatBox}>\n                <Text style={styles.modalStatVal}>{formatDuration(session.durationSeconds)}</Text>\n                <Text style={styles.modalStatLabel}>Dauer</Text>\n              </View>\n              <View style={styles.modalStatDivider} />\n              <View style={styles.modalStatBox}>\n                <Text style={styles.modalStatVal}>{session.readingCount.toLocaleString()}</Text>\n                <Text style={styles.modalStatLabel}>Messwerte</Text>\n              </View>\n            </View>\n\n            {/* Quality Evaluation Section */}\n            <Text style={styles.modalSectionTitle}>Bewegungs-Qualität</Text>\n            <GlassCard style={styles.detailQualityCard}>\n              <View style={styles.anomalyRow}>\n                <Text style={styles.anomalyLabelText}>Ø Anomalie-Score:</Text>\n                <Text style={[styles.anomalyValueText, { color: getAnomalyColor(stats.avgAnomaly) }]}>\n                  {stats.avgAnomaly !== null ? stats.avgAnomaly.toFixed(3) : '—'}\n                </Text>\n              </View>\n              \n              {stats.avgAnomaly !== null && (\n                <View style={styles.qualityBarBg}>\n                  <View \n                    style={[\n                      styles.qualityBarFill, \n                      { \n                        backgroundColor: getAnomalyColor(stats.avgAnomaly),\n                        width: `${Math.min(100, Math.max(0, ((5 - stats.avgAnomaly) / 6) * 100))}%`\n                      }\n                    ]} \n                  />\n                </View>\n              )}\n              \n              <Text style={[styles.qualityDescription, { color: getAnomalyColor(stats.avgAnomaly) }]}>\n                {getAnomalyLabel(stats.avgAnomaly)}\n              </Text>\n            </GlassCard>\n\n            {/* Exercise breakdown percentage */}\n            {stats.exercisePercentages.length > 0 && (\n              <>\n                <Text style={styles.modalSectionTitle}>Aktivitäts-Verteilung</Text>\n                <GlassCard style={styles.breakdownCard}>\n                  {stats.exercisePercentages.map((item, idx) => (\n                    <View key={idx} style={styles.breakdownRow}>\n                      <View style={styles.breakdownLabelGroup}>\n                        <Text style={styles.breakdownName}>{item.name}</Text>\n                        <Text style={styles.breakdownPercent}>{item.percentage}%</Text>\n                      </View>\n                      <View style={styles.breakdownBarBg}>\n                        <View style={[styles.breakdownBarFill, { width: `${item.percentage}%` }]} />\n                      </View>\n                    </View>\n                  ))}\n                </GlassCard>\n              </>\n            )}\n\n            {/* Tips summary */}\n            {stats.tipsList.length > 0 && (\n              <>\n                <Text style={styles.modalSectionTitle}>Hinweise zur Ausführung</Text>\n                <GlassCard style={styles.tipsCard}>\n                  {stats.tipsList.map((tip, idx) => (\n                    <View key={idx} style={styles.tipRow}>\n                      <Text style={styles.tipText}>💡 {tip.text}</Text>\n                      <Text style={styles.tipCount}>{tip.count}x</Text>\n                    </View>\n                  ))}\n                </GlassCard>\n              </>\n            )}\n          </ScrollView>\n\n          {/* Close button at bottom */}\n          <TouchableOpacity style={styles.footerCloseBtn} onPress={onClose}>\n            <Text style={styles.footerCloseBtnText}>Schließen</Text>\n          </TouchableOpacity>\n        </GlassCard>\n      </View>\n    </Modal>\n  );\n}\n\nexport default function HistoryScreen() {\n  const { sessions, setSessions } = useTrainingStore();\n  const [loading, setLoading] = useState(false);\n  const [error, setError] = useState<string | null>(null);\n  const [selectedSession, setSelectedSession] = useState<TrainingSession | null>(null);\n\n  async function fetchSessions() {\n    setLoading(true);\n    setError(null);\n    try {\n      const res = await fetch(`${API_BASE}/api/sessions`);\n      if (!res.ok) throw new Error(`HTTP ${res.status}`);\n      const data: TrainingSession[] = await res.json();\n      setSessions(data);\n      // Sync local cache\n      await AsyncStorage.setItem('movelink_sessions', JSON.stringify(data));\n    } catch {\n      // Offline fallback: try reading from AsyncStorage\n      try {\n        const localData = await AsyncStorage.getItem('movelink_sessions');\n        if (localData) {\n          const parsed = JSON.parse(localData);\n          setSessions(parsed);\n        } else {\n          setError('Backend nicht erreichbar.\\nLäuft docker compose up?');\n        }\n      } catch {\n        setError('Backend nicht erreichbar.\\nLäuft docker compose up?');\n      }\n    } finally {\n      setLoading(false);\n    }\n  }\n\n  useEffect(() => {\n    // Immediately load from cache for instant response, then fetch latest from backend\n    const loadCache = async () => {\n      try {\n        const localData = await AsyncStorage.getItem('movelink_sessions');\n        if (localData) {\n          const parsed = JSON.parse(localData);\n          setSessions(parsed);\n        }\n      } catch {}\n    };\n    loadCache().then(() => {\n      fetchSessions();\n    });\n  }, []);\n\n  return (\n    <SafeAreaView style={styles.safe}>\n      <StatusBar barStyle=\"light-content\" backgroundColor={Colors.bg} />\n\n      {/* Fixed header — always visible */}\n      <View style={styles.header}>\n        <FadeSlide delay={0}>\n          <AnimatedLogo />\n          <Text style={styles.pageTitle}>Verlauf</Text>\n        </FadeSlide>\n      </View>\n\n      {/* Content area fills remaining space */}\n      <View style={styles.body}>\n        {loading && (\n          <View style={styles.center}>\n            <ActivityIndicator color={Colors.primary} size=\"large\" />\n            <Text style={styles.loadingText}>Lade Einheiten…</Text>\n          </View>\n        )}\n\n        {!loading && error && (\n          <FadeSlide from={{ opacity: 0, scale: 0.96, translateY: 0 }} style={styles.center as any}>\n            <View style={styles.errorCard}>\n              <Text style={styles.errorIcon}>⚠️</Text>\n              <Text style={styles.errorText}>{error}</Text>\n              <TouchableOpacity style={styles.retryBtn} onPress={fetchSessions}>\n                <Text style={styles.retryText}>Erneut versuchen</Text>\n              </TouchableOpacity>\n            </View>\n          </FadeSlide>\n        )}\n\n        {!loading && !error && sessions.length === 0 && (\n          <FadeSlide style={styles.center as any}>\n            <LinearGradient colors={['rgba(0,212,170,0.06)', 'transparent']} style={styles.emptyCard}>\n              <Text style={styles.emptyIcon}>🏋️</Text>\n              <Text style={styles.emptyTitle}>Noch keine Einheiten</Text>\n              <Text style={styles.emptyBody}>Verbinde deinen Sensor und starte ein Training.</Text>\n            </LinearGradient>\n          </FadeSlide>\n        )}\n\n        {!loading && !error && sessions.length > 0 && (\n          <FlatList\n            data={sessions}\n            keyExtractor={(item) => item.id}\n            contentContainerStyle={styles.list}\n            showsVerticalScrollIndicator={false}\n            ListHeaderComponent={\n              <>\n                <StatsDashboard sessions={sessions} />\n                <Text style={styles.countLabel}>\n                  {sessions.length} {sessions.length === 1 ? 'Einheit' : 'Einheiten'}\n                </Text>\n              </>\n            }\n            renderItem={({ item, index }) => (\n              <SessionCard session={item} index={index} onPress={() => setSelectedSession(item)} />\n            )}\n            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}\n          />\n        )}\n      </View>\n\n      <SessionDetailModal\n        session={selectedSession}\n        visible={selectedSession !== null}\n        onClose={() => setSelectedSession(null)}\n      />\n    </SafeAreaView>\n  );\n}\n\nconst styles = StyleSheet.create({\n  safe: { flex: 1, backgroundColor: 'transparent' },\n  header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 4 },\n  pageTitle: { color: Colors.text, fontSize: 30, fontWeight: '800', letterSpacing: -0.5, marginTop: 10, marginBottom: 4 },\n  body: { flex: 1 },\n  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },\n  loadingText: { color: Colors.textSub, fontSize: 13, marginTop: 12 },\n\n  errorCard: {\n    backgroundColor: Colors.surface, borderRadius: 20, padding: 28,\n    alignItems: 'center', gap: 12,\n    borderWidth: 1, borderColor: 'rgba(248,113,113,0.2)', maxWidth: 300,\n  },\n  errorIcon: { fontSize: 32 },\n  errorText: { color: Colors.textSub, fontSize: 13, textAlign: 'center', lineHeight: 20 },\n  retryBtn: { backgroundColor: Colors.primary, paddingHorizontal: 22, paddingVertical: 10, borderRadius: 10, marginTop: 4 },\n  retryText: { color: Colors.bg, fontSize: 13, fontWeight: '700' },\n\n  emptyCard: {\n    borderRadius: 20, padding: 36, alignItems: 'center', gap: 10,\n    borderWidth: 1, borderColor: Colors.border,\n  },\n  emptyIcon: { fontSize: 40 },\n  emptyTitle: { color: Colors.text, fontSize: 17, fontWeight: '700' },\n  emptyBody: { color: Colors.textSub, fontSize: 13, textAlign: 'center', lineHeight: 20, maxWidth: 240 },\n\n  list: { paddingHorizontal: 20, paddingBottom: 40 },\n  countLabel: { color: Colors.textSub, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },\n  statsCard: {\n    padding: 16,\n    borderRadius: 16,\n    marginBottom: 20,\n    gap: 12,\n  },\n  statsTitle: {\n    color: Colors.text,\n    fontSize: 14,\n    fontWeight: '700',\n    letterSpacing: 0.5,\n  },\n  statsGrid: {\n    flexDirection: 'row',\n    alignItems: 'center',\n    justifyContent: 'space-between',\n    paddingVertical: 4,\n  },\n  statBox: {\n    flex: 1,\n    alignItems: 'center',\n    gap: 2,\n  },\n  statBoxVal: {\n    color: Colors.primary,\n    fontSize: 20,\n    fontWeight: '800',\n  },\n  statBoxLabel: {\n    color: Colors.textSub,\n    fontSize: 10,\n    fontWeight: '600',\n    textTransform: 'uppercase',\n    letterSpacing: 0.5,\n  },\n  statBoxDivider: {\n    width: 1,\n    height: 30,\n    backgroundColor: Colors.border,\n  },\n  readingsSummary: {\n    borderTopWidth: 1,\n    borderTopColor: Colors.border,\n    paddingTop: 10,\n    alignItems: 'center',\n  },\n  readingsText: {\n    color: Colors.textSub,\n    fontSize: 11,\n    fontWeight: '500',\n  },\n  readingsHighlight: {\n    color: Colors.text,\n    fontWeight: '700',\n  },\n  modalOverlay: {\n    flex: 1,\n    backgroundColor: 'rgba(0,0,0,0.7)',\n    justifyContent: 'flex-end',\n  },\n  modalCard: {\n    borderTopLeftRadius: 24,\n    borderTopRightRadius: 24,\n    borderBottomLeftRadius: 0,\n    borderBottomRightRadius: 0,\n    maxHeight: '90%',\n    padding: 24,\n    gap: 16,\n    borderWidth: 1.5,\n    borderColor: Colors.border,\n  },\n  modalHeader: {\n    flexDirection: 'row',\n    justifyContent: 'space-between',\n    alignItems: 'center',\n    marginBottom: 8,\n  },\n  modalTitle: {\n    color: Colors.text,\n    fontSize: 20,\n    fontWeight: '800',\n    letterSpacing: -0.5,\n  },\n  modalSub: {\n    color: Colors.textSub,\n    fontSize: 12,\n    fontWeight: '500',\n    marginTop: 2,\n  },\n  closeBtn: {\n    width: 32,\n    height: 32,\n    borderRadius: 16,\n    backgroundColor: Colors.surfaceActive,\n    alignItems: 'center',\n    justifyContent: 'center',\n    borderWidth: 1,\n    borderColor: Colors.border,\n  },\n  closeBtnText: {\n    color: Colors.textSub,\n    fontSize: 14,\n    fontWeight: '600',\n  },\n  modalScroll: {\n    gap: 18,\n    paddingBottom: 24,\n  },\n  modalStatsGrid: {\n    flexDirection: 'row',\n    backgroundColor: 'rgba(255,255,255,0.03)',\n    borderRadius: 16,\n    paddingVertical: 16,\n    borderWidth: 1,\n    borderColor: Colors.border,\n  },\n  modalStatBox: {\n    flex: 1,\n    alignItems: 'center',\n    gap: 2,\n  },\n  modalStatVal: {\n    color: Colors.primary,\n    fontSize: 18,\n    fontWeight: '800',\n  },\n  modalStatLabel: {\n    color: Colors.textSub,\n    fontSize: 10,\n    fontWeight: '600',\n    textTransform: 'uppercase',\n    letterSpacing: 0.5,\n  },\n  modalStatDivider: {\n    width: 1,\n    height: 24,\n    backgroundColor: Colors.border,\n    alignSelf: 'center',\n  },\n  modalSectionTitle: {\n    color: Colors.textSub,\n    fontSize: 10,\n    fontWeight: '700',\n    textTransform: 'uppercase',\n    letterSpacing: 1,\n    marginTop: 8,\n  },\n  detailQualityCard: {\n    padding: 16,\n    gap: 10,\n    borderWidth: 1,\n    borderColor: Colors.border,\n    borderRadius: 16,\n  },\n  anomalyRow: {\n    flexDirection: 'row',\n    justifyContent: 'space-between',\n    alignItems: 'center',\n  },\n  anomalyLabelText: {\n    color: Colors.textSub,\n    fontSize: 12,\n    fontWeight: '600',\n  },\n  anomalyValueText: {\n    fontSize: 18,\n    fontWeight: '800',\n  },\n  qualityBarBg: {\n    height: 6,\n    backgroundColor: 'rgba(255,255,255,0.08)',\n    borderRadius: 3,\n    overflow: 'hidden',\n  },\n  qualityBarFill: {\n    height: '100%',\n    borderRadius: 3,\n  },\n  qualityDescription: {\n    fontSize: 11,\n    fontWeight: '700',\n    textTransform: 'uppercase',\n    letterSpacing: 0.5,\n    textAlign: 'right',\n  },\n  breakdownCard: {\n    padding: 16,\n    gap: 12,\n    borderWidth: 1,\n    borderColor: Colors.border,\n    borderRadius: 16,\n  },\n  breakdownRow: {\n    gap: 6,\n  },\n  breakdownLabelGroup: {\n    flexDirection: 'row',\n    justifyContent: 'space-between',\n    alignItems: 'center',\n  },\n  breakdownName: {\n    color: Colors.text,\n    fontSize: 13,\n    fontWeight: '700',\n  },\n  breakdownPercent: {\n    color: Colors.primary,\n    fontSize: 13,\n    fontWeight: '800',\n  },\n  breakdownBarBg: {\n    height: 6,\n    backgroundColor: 'rgba(255,255,255,0.06)',\n    borderRadius: 3,\n    overflow: 'hidden',\n  },\n  breakdownBarFill: {\n    height: '100%',\n    backgroundColor: Colors.primary,\n    borderRadius: 3,\n  },\n  tipsCard: {\n    padding: 16,\n    gap: 10,\n    borderWidth: 1,\n    borderColor: Colors.border,\n    borderRadius: 16,\n  },\n  tipRow: {\n    flexDirection: 'row',\n    justifyContent: 'space-between',\n    alignItems: 'center',\n  },\n  tipText: {\n    color: Colors.text,\n    fontSize: 13,\n    fontWeight: '600',\n    flex: 1,\n  },\n  tipCount: {\n    color: Colors.textSub,\n    fontSize: 11,\n    fontWeight: '700',\n    backgroundColor: Colors.surfaceActive,\n    paddingHorizontal: 8,\n    paddingVertical: 3,\n    borderRadius: 6,\n    borderWidth: 1,\n    borderColor: Colors.border,\n  },\n  footerCloseBtn: {\n    backgroundColor: Colors.primary,\n    borderRadius: 16,\n    paddingVertical: 16,\n    alignItems: 'center',\n    justifyContent: 'center',\n    marginTop: 8,\n  },\n  footerCloseBtnText: {\n    color: Colors.bg,\n    fontSize: 15,\n    fontWeight: '800',\n    letterSpacing: 0.5,\n  },\n});\n",
    "embedded/src/components/inferenz_engine/InferenceEngine_impl.h": "// C4-Ebene: Code\n#include \"InferenceEngine.h\"\n#include <Erlind-project-1_inferencing.h>\n\n// @implements FA2.2, FA2.3\nbool runModelInference(float* buffer, String& outLabel, float& outConfidence, float& outAnomaly) {\n    // Signal aus Puffer erstellen\n    signal_t signal;\n    int err = numpy::signal_from_buffer(buffer, EI_CLASSIFIER_DSP_INPUT_FRAME_SIZE, &signal);\n    if (err != 0) {\n        return false;\n    }\n\n    // Klassifikator ausführen\n    ei_impulse_result_t result = { 0 };\n    bool debug_nn = false;\n    err = run_classifier(&signal, &result, debug_nn);\n    if (err != EI_IMPULSE_OK) {\n        return false;\n    }\n\n    // Variablen für den besten Treffer\n    int best_idx = 0;\n    float best_val = 0.0;\n    for (size_t ix = 0; ix < EI_CLASSIFIER_LABEL_COUNT; ix++) {\n        if (result.classification[ix].value > best_val) {\n            best_val = result.classification[ix].value;\n            best_idx = ix;\n        }\n    }\n\n    // Anomalie-Score abgreifen\n    float anomaly_score = result.anomaly;\n\n    Serial.print(\"Label: \");\n    Serial.print(result.classification[best_idx].label);\n    Serial.print(\" | Conf: \");\n    Serial.print(best_val, 3);\n    Serial.print(\" | Anomaly: \");\n    Serial.println(anomaly_score, 3);\n\n    outLabel = String(result.classification[best_idx].label);\n    outConfidence = best_val;\n    outAnomaly = anomaly_score;\n\n    return true;\n}\n",
    "embedded/.pio/libdeps/seeed_xiao_nrf52840_sense/ArduinoBLE/README.md": "# ArduinoBLE\n\n[![Compile Examples Status](https://github.com/arduino-libraries/ArduinoBLE/workflows/Compile%20Examples/badge.svg)](https://github.com/arduino-libraries/ArduinoBLE/actions?workflow=Compile+Examples) [![Spell Check Status](https://github.com/arduino-libraries/ArduinoBLE/workflows/Spell%20Check/badge.svg)](https://github.com/arduino-libraries/ArduinoBLE/actions?workflow=Spell+Check)\n\nEnables Bluetooth® Low Energy connectivity on the Arduino MKR WiFi 1010, Arduino UNO WiFi Rev.2, Arduino Nano 33 IoT, Arduino Nano 33 BLE, Arduino Portenta H7, Arduino Giga R1 and Arduino UNO R4 WiFi.\n\nThis library supports creating a Bluetooth® Low Energy peripheral & central mode.\n\nFor the Arduino MKR WiFi 1010, Arduino UNO WiFi Rev.2, and Arduino Nano 33 IoT boards, it requires the NINA module to be running [Arduino NINA-W102 firmware](https://github.com/arduino/nina-fw) v1.2.0 or later.\n\nFor the Arduino UNO R4 WiFi, it requires the ESP32-S3 module to be running [firmware](https://github.com/arduino/uno-r4-wifi-usb-bridge) v0.2.0 or later.\n\n\nFor more information about this library please visit us at:\nhttps://www.arduino.cc/en/Reference/ArduinoBLE\n\n## License\n\n```\nCopyright (c) 2019 Arduino SA. All rights reserved.\n\nThis library is free software; you can redistribute it and/or\nmodify it under the terms of the GNU Lesser General Public\nLicense as published by the Free Software Foundation; either\nversion 2.1 of the License, or (at your option) any later version.\n\nThis library is distributed in the hope that it will be useful,\nbut WITHOUT ANY WARRANTY; without even the implied warranty of\nMERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU\nLesser General Public License for more details.\n\nYou should have received a copy of the GNU Lesser General Public\nLicense along with this library; if not, write to the Free Software\nFoundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA\n```\n",
    "embedded/src/components/sensordatenerfassung/IMUReader.h": "#ifndef IMU_READER_H\n#define IMU_READER_H\n\n#include <Arduino.h>\n\n// @implements FA2.1, NF1\nbool initIMU();\n\n// @implements FA2.1, NF1\nvoid readSensorData(float* buffer, size_t startIndex);\n\n#endif // IMU_READER_H\n",
    "embedded/src/components/sensordatenerfassung/architecture.md": "<!--\nC4-Ebene: Component\nDeployable: Nein\nfullfills: FA2.1\n-->\n\n# Sensordatenerfassung (Loop)\n\nDiese Komponente liest kontinuierlich die Rohwerte des Beschleunigungssensors und Gyroskops aus.\n\n## C4-Architektur-Ebene\n* **C4-Ebene:** Component\n* **Deployable:** Nein (Läuft als Teil des Sensor Firmware Containers)\n\n## Beschreibung\nDie Sensordatenerfassung liest in einer festen Schleife (Loop) die 6-Achsen-IMU-Werte (Beschleunigung und Drehung) des LSM6DS3-Sensors über den I2C-Bus ein.\n\n## Requirements\n\n**FA2.1**: Das Gerät sammelt die Dreh- und Beschleunigungsdaten des Trainierenden.\n**FA2.1.1**: Beschleunigung wird eingelesen\n**FA2.1.2**: Drehung wird eingelesen\n\n## Technische Details\n- **Abtastrate:** 50 Hz (gesteuert durch präzises Timing in Microsekunden)\n- **Signal-Clamping:** Beschleunigungswerte werden auf max. ±2.0 G gedämpft/geclampt.\n- **Konvertierung:** Die Werte werden in die SI-Einheit $m/s^2$ konvertiert ($1\\,G = 9.80665\\,m/s^2$).\n- **Verwendete Hardware:** LSM6DS3 IMU auf dem XIAO nRF52840 Sense.\n\n## Datenfluss\n\n```mermaid\nflowchart LR\n    IMU[LSM6DS3 Sensor] -->|I2C Rohdaten| Loop[Loop in Executable.ino]\n    Loop -->|1. Clamping auf 2G| Calc[Skalierung & m/s^2 Konvertierung]\n    Calc -->|2. Puffer befüllen| DSP[Edge Impulse DSP Puffer]\n```\n",
    "app/components/session_card/SessionCard.tsx": "/**\n * @implements FA1.6\n */\nimport React from 'react';\nimport { View, Text, TouchableOpacity, StyleSheet } from 'react-native';\nimport { FadeSlide } from '@/components/FadeSlide';\nimport { Colors } from '@/constants/Colors';\nimport { TrainingSession } from '@/store';\n\ninterface Props {\n  session: TrainingSession;\n  onPress: () => void;\n  index?: number;\n}\n\nfunction formatDuration(s: number) {\n  const m = Math.floor(s / 60);\n  const sec = s % 60;\n  return `${m}:${sec.toString().padStart(2, '0')}`;\n}\n\nfunction formatDate(iso: string) {\n  return new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' });\n}\n\nfunction formatTime(iso: string) {\n  return new Date(iso).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });\n}\n\nexport function SessionCard({ session, onPress, index = 0 }: Props) {\n  return (\n    <FadeSlide delay={index * 60}>\n      <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>\n        <View style={styles.accent} />\n        <View style={styles.body}>\n          <View style={styles.dateRow}>\n            <Text style={styles.date}>{formatDate(session.startedAt)}</Text>\n            <Text style={styles.time}>{formatTime(session.startedAt)}</Text>\n          </View>\n          <View style={styles.statsRow}>\n            <View style={styles.stat}>\n              <Text style={styles.statValue}>{formatDuration(session.durationSeconds)}</Text>\n              <Text style={styles.statLabel}>Dauer</Text>\n            </View>\n            <View style={styles.divider} />\n            <View style={styles.stat}>\n              <Text style={styles.statValue}>{session.readingCount.toLocaleString()}</Text>\n              <Text style={styles.statLabel}>Messwerte</Text>\n            </View>\n          </View>\n        </View>\n        <Text style={styles.arrow}>›</Text>\n      </TouchableOpacity>\n    </FadeSlide>\n  );\n}\n\nconst styles = StyleSheet.create({\n  card: {\n    flexDirection: 'row',\n    alignItems: 'center',\n    backgroundColor: Colors.surface,\n    borderRadius: 16,\n    borderWidth: 1,\n    borderColor: Colors.border,\n    overflow: 'hidden',\n    gap: 14,\n    paddingRight: 16,\n    paddingVertical: 14,\n  },\n  accent: {\n    width: 3,\n    alignSelf: 'stretch',\n    backgroundColor: Colors.primary,\n    borderTopRightRadius: 2,\n    borderBottomRightRadius: 2,\n  },\n  body: { flex: 1, gap: 8 },\n  dateRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },\n  date: { color: Colors.text, fontSize: 14, fontWeight: '700' },\n  time: { color: Colors.textSub, fontSize: 12 },\n  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },\n  stat: { gap: 1 },\n  statValue: { color: Colors.primary, fontSize: 15, fontWeight: '800', fontVariant: ['tabular-nums'] },\n  statLabel: { color: Colors.textSub, fontSize: 10, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5 },\n  divider: { width: 1, height: 28, backgroundColor: Colors.border },\n  arrow: { color: Colors.textMuted, fontSize: 22, fontWeight: '300' },\n});\n",
    "database/architecture.md": "<!--\nC4-Ebene: Container\nDeployable: Ja\n-->\n\n# MoveLink Database & Backend - Container-Architektur\n\nDieses Dokument beschreibt die Datenbank und den Backend-Service als eigenständigen Container im C4-Modell.\n\n## C4-Architektur-Ebene\n* **C4-Ebene:** Container\n* **Deployable:** Ja\n* **Deployment-Artefakt:** Docker Image / Cloud Service\n* **Technologie-Stack:** Node.js, Express, PostgreSQL / SQLite\n\n## Beschreibung\nDer Datenbank- und Backend-Container dient als zentraler Datenspeicher und API-Gateway für die MoveLink-Applikation. Er nimmt Trainingsdaten und Profile auf, validiert Benutzer und stellt sicher, dass historische Bewegungsdaten zur späteren Analyse persistent abgelegt werden.\n\n## Requirements\n\n**FA3.1**: Das System speichert und verifiziert Benutzerprofile und Anmeldeinformationen persistent.\n**FA3.2**: Das System speichert aufgezeichnete Trainingseinheiten (Übungstyp, Wiederholungen, Qualität) persistent zur historischen Auswertung.\n\n## Komponenten in diesem Container\nDie API- und Datenbankschnittstelle besteht aus folgenden logischen Komponenten:\n1. **ProfileController / Auth Service**: Authentifiziert Benutzer und liefert Profildaten. (Erfüllt: FA3.1)\n2. **Trainings-DB / Session Store**: Speichert und indiziert abgeschlossene Repetitions- und Sessiondaten. (Erfüllt: FA3.2)\n",
    "embedded/.pio/libdeps/xiaoblesense/ArduinoBLE/README.md": "# ArduinoBLE\n\n[![Compile Examples Status](https://github.com/arduino-libraries/ArduinoBLE/workflows/Compile%20Examples/badge.svg)](https://github.com/arduino-libraries/ArduinoBLE/actions?workflow=Compile+Examples) [![Spell Check Status](https://github.com/arduino-libraries/ArduinoBLE/workflows/Spell%20Check/badge.svg)](https://github.com/arduino-libraries/ArduinoBLE/actions?workflow=Spell+Check)\n\nEnables Bluetooth® Low Energy connectivity on the Arduino MKR WiFi 1010, Arduino UNO WiFi Rev.2, Arduino Nano 33 IoT, Arduino Nano 33 BLE, Arduino Portenta H7, Arduino Giga R1 and Arduino UNO R4 WiFi.\n\nThis library supports creating a Bluetooth® Low Energy peripheral & central mode.\n\nFor the Arduino MKR WiFi 1010, Arduino UNO WiFi Rev.2, and Arduino Nano 33 IoT boards, it requires the NINA module to be running [Arduino NINA-W102 firmware](https://github.com/arduino/nina-fw) v1.2.0 or later.\n\nFor the Arduino UNO R4 WiFi, it requires the ESP32-S3 module to be running [firmware](https://github.com/arduino/uno-r4-wifi-usb-bridge) v0.2.0 or later.\n\n\nFor more information about this library please visit us at:\nhttps://www.arduino.cc/en/Reference/ArduinoBLE\n\n## License\n\n```\nCopyright (c) 2019 Arduino SA. All rights reserved.\n\nThis library is free software; you can redistribute it and/or\nmodify it under the terms of the GNU Lesser General Public\nLicense as published by the Free Software Foundation; either\nversion 2.1 of the License, or (at your option) any later version.\n\nThis library is distributed in the hope that it will be useful,\nbut WITHOUT ANY WARRANTY; without even the implied warranty of\nMERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU\nLesser General Public License for more details.\n\nYou should have received a copy of the GNU Lesser General Public\nLicense along with this library; if not, write to the Free Software\nFoundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA\n```\n",
    "embedded/src/components/ble_streamer/BLEStreamer.h": "#ifndef BLE_STREAMER_H\n#define BLE_STREAMER_H\n\n#include <Arduino.h>\n\n// @implements FA2.5\nbool initBLE();\n\n// @implements FA2.5\nvoid streamIMUData(float ax, float ay, float az, float gx, float gy, float gz);\n\nvoid streamInferenceResult(const String& label, float confidence, float anomaly, const String& tipp);\n\nvoid pollBLE();\n\nbool isBLEConnected();\n\n#endif // BLE_STREAMER_H\n",
    "app/hooks/useBLE.ts": "/**\n * @implements FA1.3, FA1.5, NF2\n */\nimport { useEffect, useRef, useCallback } from 'react';\nimport { Platform, PermissionsAndroid } from 'react-native';\nimport {\n  BleManager,\n  Device,\n  BleError,\n  Characteristic,\n  State,\n} from 'react-native-ble-plx';\nimport { BLE_SERVICE_UUID, BLE_IMU_CHARACTERISTIC_UUID, BLE_INFERENCE_CHARACTERISTIC_UUID, BLE_RECONNECT_DELAY_MS, BLE_MAX_RECONNECT_ATTEMPTS } from '@/constants/BLE';\nimport { useBLEStore, useTrainingStore, IMUReading } from '@/store';\n\nfunction decodeBase64ToString(base64: string): string {\n  try {\n    return atob(base64);\n  } catch {\n    return '';\n  }\n}\n\nfunction parseIMUPacket(base64: string): IMUReading | null {\n  try {\n    const binaryString = atob(base64);\n    const len = binaryString.length;\n    const bytes = new Uint8Array(len);\n    for (let i = 0; i < len; i++) {\n      bytes[i] = binaryString.charCodeAt(i);\n    }\n    const floats = new Float32Array(bytes.buffer);\n    if (floats.length < 6) return null;\n    return {\n      timestamp: Date.now(),\n      accelX: floats[0],\n      accelY: floats[1],\n      accelZ: floats[2],\n      gyroX: floats[3],\n      gyroY: floats[4],\n      gyroZ: floats[5],\n    };\n  } catch (e) {\n    console.error(\"parseIMUPacket error:\", e);\n    return null;\n  }\n}\n\nexport function useBLE() {\n  const manager = useRef<BleManager | null>(null);\n  const reconnectAttempts = useRef(0);\n  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);\n  const simInterval = useRef<ReturnType<typeof setInterval> | null>(null);\n  const simStartTime = useRef<number>(0);\n\n  const { setStatus, setDevice, setReading, disconnect, status } = useBLEStore();\n  const { addReading, isRecording } = useTrainingStore();\n\n  useEffect(() => {\n    // BLE is not available on web\n    if (Platform.OS === 'web') return;\n\n    let subscription: { remove: () => void } | null = null;\n    try {\n      manager.current = new BleManager();\n      subscription = manager.current.onStateChange((state) => {\n        if (state === State.PoweredOn) subscription?.remove();\n      }, true);\n    } catch (e) {\n      console.warn(\"BleManager could not be initialized. This is expected inside Expo Go. Standing by for Dev Client build.\");\n      manager.current = null;\n    }\n\n    return () => {\n      if (subscription) {\n        try {\n          subscription.remove();\n        } catch (e) { }\n      }\n      if (manager.current) {\n        try {\n          manager.current.destroy();\n        } catch (e) { }\n      }\n      if (simInterval.current) clearInterval(simInterval.current);\n    };\n  }, []);\n\n  const handleDisconnect = useCallback((deviceId: string) => {\n    setStatus('disconnected');\n    if (reconnectAttempts.current >= BLE_MAX_RECONNECT_ATTEMPTS) {\n      setStatus('error');\n      return;\n    }\n    reconnectTimer.current = setTimeout(() => {\n      reconnectAttempts.current += 1;\n      connectToDevice(deviceId);\n    }, BLE_RECONNECT_DELAY_MS);\n  }, []);\n\n  const connectToDevice = useCallback(async (deviceId: string) => {\n    if (!manager.current) return;\n    const currentStatus = useBLEStore.getState().status;\n    if (currentStatus === 'connecting' || currentStatus === 'connected') {\n      return;\n    }\n    try {\n      setStatus('connecting');\n      let device = null;\n      for (let attempt = 1; attempt <= 3; attempt++) {\n        try {\n          device = await manager.current.connectToDevice(deviceId, {\n            autoConnect: Platform.OS === 'android',\n            timeout: 15000,\n          });\n        } catch (err: any) {\n          const errMsg = err?.message || '';\n          if (errMsg.includes('already connected') || errMsg.includes('already') || errMsg.includes('connected')) {\n            try {\n              const connected = await manager.current.connectedDevices([BLE_SERVICE_UUID]);\n              device = connected.find(d => d.id === deviceId) || null;\n            } catch (e) {}\n          }\n          if (!device) {\n            console.warn(`BLE Connect attempt ${attempt} failed:`, err);\n            if (attempt === 3) throw err;\n            await new Promise(r => setTimeout(r, 1500));\n            continue;\n          }\n        }\n\n        try {\n          await new Promise(r => setTimeout(r, 600));\n          if (Platform.OS === 'android') {\n            try { await device.requestMTU(512); } catch (e) { }\n          }\n          await device.discoverAllServicesAndCharacteristics();\n          break;\n        } catch (err) {\n          console.warn(`BLE Discovery attempt ${attempt} failed:`, err);\n          if (attempt === 3) throw err;\n          await new Promise(r => setTimeout(r, 1500));\n        }\n      }\n      if (!device) throw new Error(\"Keine Verbindung möglich\");\n\n      setDevice(device.id, device.name ?? 'MoveLink Sensor');\n      setStatus('connected');\n      reconnectAttempts.current = 0;\n\n      // autoConnect nutzt langsame Verbindungsparameter – jetzt auf schnell umschalten\n      if (Platform.OS === 'android') {\n        try {\n          // 1 = CONNECTION_PRIORITY_HIGH (7.5ms Intervall statt 100ms+)\n          await device.requestConnectionPriority(1);\n        } catch (e) { }\n      }\n\n      device.onDisconnected(() => handleDisconnect(device.id));\n\n      device.monitorCharacteristicForService(\n        BLE_SERVICE_UUID,\n        BLE_IMU_CHARACTERISTIC_UUID,\n        (error: BleError | null, characteristic: Characteristic | null) => {\n          if (error || !characteristic?.value) return;\n          const reading = parseIMUPacket(characteristic.value);\n          if (!reading) return;\n          setReading(reading);\n          if (useTrainingStore.getState().isRecording) {\n            useTrainingStore.getState().addReading(reading);\n          }\n        }\n      );\n\n      device.monitorCharacteristicForService(\n        BLE_SERVICE_UUID,\n        BLE_INFERENCE_CHARACTERISTIC_UUID,\n        (error: BleError | null, characteristic: Characteristic | null) => {\n          if (error || !characteristic?.value) return;\n          const rawStr = decodeBase64ToString(characteristic.value);\n          const jsonStr = rawStr ? rawStr.replace(/\\0/g, '').trim() : '';\n          if (!jsonStr || !jsonStr.startsWith('{') || !jsonStr.endsWith('}')) return;\n          try {\n            console.log(\"BLE Inference Raw JSON:\", jsonStr);\n            const data = JSON.parse(jsonStr);\n            if (data && typeof data.label === 'string') {\n              useBLEStore.getState().setInference(data.label, data.conf ?? 0, data.anomaly ?? 0, data.tipp ?? '');\n              if (useTrainingStore.getState().isRecording) {\n                useTrainingStore.getState().addInference({\n                  label: data.label,\n                  confidence: data.conf ?? 0,\n                  anomaly: data.anomaly ?? 0,\n                  tipp: data.tipp ?? '',\n                });\n              }\n            }\n          } catch (e) {\n            console.error(\"Error parsing BLE inference JSON:\", e, jsonStr);\n          }\n        }\n      );\n    } catch {\n      setStatus('error');\n    }\n  }, [handleDisconnect]);\n\n  const startScan = useCallback(async () => {\n    const { isDemoMode } = useBLEStore.getState();\n\n    // Trigger simulation if:\n    // - Demo mode is explicitly turned on\n    // - Running in web browser\n    // - running in Expo Go (where manager is null)\n    if (isDemoMode || Platform.OS === 'web' || !manager.current) {\n      setStatus('connecting');\n      setTimeout(() => {\n        setDevice('mock-device-id', isDemoMode ? 'Simulierter Sensor (Demo)' : (!manager.current ? 'Simulierter Sensor (Expo Go)' : 'Simulierter Web-Sensor'));\n        setStatus('connected');\n        reconnectAttempts.current = 0;\n\n        if (simInterval.current) clearInterval(simInterval.current);\n        simStartTime.current = Date.now();\n\n        simInterval.current = setInterval(() => {\n          const { isRecording: activeRecording } = useTrainingStore.getState();\n          const t = (Date.now() - simStartTime.current) / 1000;\n\n          // Repetition duration = 4s\n          const T = 4;\n          const phase = (2 * Math.PI * t) / T;\n\n          // Smooth sine curve representing angles (5° up to 85° back and forth)\n          const targetAngle = 5 + 80 * (0.5 - 0.5 * Math.cos(phase));\n          const rad = targetAngle * (Math.PI / 180);\n\n          // Gyroscope rate of change in rad/s: d/dt(rad)\n          const omega = (2 * Math.PI) / T;\n          const gyroRateRad = (80 * (Math.PI / 180) * 0.5 * omega * Math.sin(phase));\n\n          const reading: IMUReading = {\n            timestamp: Date.now(),\n            accelX: 0,\n            accelY: Math.sin(rad),\n            accelZ: Math.cos(rad),\n            gyroX: gyroRateRad,\n            gyroY: 0,\n            gyroZ: 0,\n          };\n\n          setReading(reading);\n          if (activeRecording) {\n            useTrainingStore.getState().addReading(reading);\n          }\n\n          // Simulate Chip Inference in demo mode\n          const repTime = t % 4;\n          let mockLabel = \"idle\";\n          let mockConf = 0.99;\n          let mockAnomaly = 0.05;\n          let mockTipp = \"Bereit\";\n\n          if (repTime > 1.8 && repTime < 2.2) {\n            mockLabel = \"curl\";\n            mockConf = 0.96;\n            mockAnomaly = -0.235;\n            mockTipp = \"Super Ausfuehrung!\";\n          }\n\n          useBLEStore.getState().setInference(mockLabel, mockConf, mockAnomaly, mockTipp);\n          if (activeRecording) {\n            useTrainingStore.getState().addInference({\n              label: mockLabel,\n              confidence: mockConf,\n              anomaly: mockAnomaly,\n              tipp: mockTipp,\n            });\n          }\n        }, 40); // 25Hz feed\n      }, 600);\n      return;\n    }\n\n    // Request permissions on Android before scanning\n    if (Platform.OS === 'android') {\n      try {\n        const apiLevel = Platform.Version;\n        if (typeof apiLevel === 'number' && apiLevel >= 31) {\n          const granted = await PermissionsAndroid.requestMultiple([\n            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,\n            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,\n            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,\n          ]);\n\n          const scanGranted = granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] === PermissionsAndroid.RESULTS.GRANTED;\n          const connectGranted = granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] === PermissionsAndroid.RESULTS.GRANTED;\n\n          if (!scanGranted || !connectGranted) {\n            console.warn(\"Bluetooth permissions denied by user.\");\n            setStatus('error');\n            return;\n          }\n        } else {\n          const granted = await PermissionsAndroid.request(\n            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION\n          );\n          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {\n            console.warn(\"Location permission denied by user (required for Bluetooth scanning on older Android versions).\");\n            setStatus('error');\n            return;\n          }\n        }\n      } catch (err) {\n        console.error(\"Error requesting Bluetooth permissions:\", err);\n        setStatus('error');\n        return;\n      }\n    }\n\n    setStatus('scanning');\n\n    manager.current.startDeviceScan(\n      null,\n      null,\n      (error: BleError | null, device: Device | null) => {\n        if (error) {\n          console.error(\"BLE Device scan error:\", error);\n          setStatus('error');\n          return;\n        }\n        if (!device) return;\n\n        const name = device.name ?? device.localName ?? '';\n        const hasService = device.serviceUUIDs?.some(uuid => uuid.toLowerCase() === BLE_SERVICE_UUID.toLowerCase());\n\n        if (name.includes('MoveLink') || hasService) {\n          manager.current?.stopDeviceScan();\n          connectToDevice(device.id);\n        }\n      }\n    );\n  }, [connectToDevice]);\n\n  const stopScan = useCallback(() => {\n    manager.current?.stopDeviceScan();\n    if (status === 'scanning') setStatus('idle');\n  }, [status]);\n\n  const disconnectDevice = useCallback(async () => {\n    if (simInterval.current) {\n      clearInterval(simInterval.current);\n      simInterval.current = null;\n    }\n    if (reconnectTimer.current) clearTimeout(reconnectTimer.current);\n    const { deviceId } = useBLEStore.getState();\n    if (deviceId && Platform.OS !== 'web' && manager.current) {\n      try {\n        await manager.current.cancelDeviceConnection(deviceId);\n      } catch (e) { }\n    }\n    disconnect();\n  }, [disconnect]);\n\n  return { startScan, stopScan, disconnectDevice };\n}\n",
    "embedded/src/main.cpp": "/* \n * @implements FA2.1, FA2.2, FA2.3, FA2.4, FA2.5, NF1\n * Includes ---------------------------------------------------------------- */\n#include <Arduino.h>\n#undef round\n#undef min\n#undef max\n#include <Erlind-project-1_inferencing.h> // For model parameters/defines\n#include \"components/sensordatenerfassung/IMUReader.h\"\n#include \"components/led_display_controller/VisualFeedback.h\"\n#include \"components/ble_streamer/BLEStreamer.h\"\n#include \"components/inferenz_engine/InferenceEngine.h\"\n\nstatic float dsp_buffer[EI_CLASSIFIER_DSP_INPUT_FRAME_SIZE] = { 0 };\n\nvoid setup()\n{\n    Serial.begin(115200);\n    initFeedback();\n    \n    // Warte kurz, damit der Serielle Monitor bereit ist\n    delay(1000);\n\n    if (!initIMU()) {\n        Serial.println(\"Failed to initialize IMU!\");\n    } else {\n        Serial.println(\"IMU initialized\");\n    }\n\n    if (!initBLE()) {\n        Serial.println(\"Failed to initialize BLE!\");\n    } else {\n        Serial.println(\"BLE initialized\");\n    }\n\n    // SICHERHEITSCHECK: Prüfen ob das Modell wirklich für 6 Achsen trainiert wurde\n    if (EI_CLASSIFIER_RAW_SAMPLES_PER_FRAME != 6) {\n        Serial.print(\"ERR: EI_CLASSIFIER_RAW_SAMPLES_PER_FRAME sollte 6 sein (Accel + Gyro)!\\n\");\n        return;\n    }\n}\n\nvoid loop()\n{\n    // Da wir 6 Achsen haben, springen wir in 6er-Schritten durch den DSP Puffer\n    size_t sample_count = EI_CLASSIFIER_DSP_INPUT_FRAME_SIZE / 6;\n    size_t send_interval = (sample_count > 20) ? (sample_count / 5) : 2;\n\n    for (size_t ix = 0; ix < EI_CLASSIFIER_DSP_INPUT_FRAME_SIZE; ix += 6) {\n        uint64_t next_tick = micros() + (EI_CLASSIFIER_INTERVAL_MS * 1000);\n\n        readSensorData(dsp_buffer, ix);\n\n        // Jedes N-te Sample per BLE senden (~10 pro Zyklus für glatte Kurven)\n        size_t sample_idx = ix / 6;\n        if (sample_idx % send_interval == 0 || ix + 6 >= EI_CLASSIFIER_DSP_INPUT_FRAME_SIZE) {\n            streamIMUData(dsp_buffer[ix], dsp_buffer[ix + 1], dsp_buffer[ix + 2],\n                          dsp_buffer[ix + 3], dsp_buffer[ix + 4], dsp_buffer[ix + 5]);\n        }\n\n        if (next_tick > micros()) {\n            delayMicroseconds(next_tick - micros());\n        }\n    }\n\n    // BLE-Polling vor Inferenz, damit Verbindungsaufbau nicht abbricht\n    pollBLE();\n\n    // Klassifikator nur ausführen, wenn wir nicht im Cooldown sind\n    if (!isFeedbackInCooldown()) {\n        String label;\n        float confidence = 0.0;\n        float anomaly = 0.0;\n        \n        if (runModelInference(dsp_buffer, label, confidence, anomaly)) {\n            // BLE-Polling nach Inferenz (die ~200-500ms gedauert hat)\n            pollBLE();\n            // Display-Aktualisierung & LED Logik\n            updateFeedback(label, confidence, anomaly);\n        } else {\n            pollBLE();\n        }\n    } else {\n        pollBLE();\n    }\n}\n\n// Inkludiere die Implementierung der Inferenz-Engine, um Mehrfachdefinitionen beim Linken zu verhindern\n#include \"components/inferenz_engine/InferenceEngine_impl.h\"\n",
    "embedded/src/components/inferenz_engine/InferenceEngine.h": "#ifndef INFERENCE_ENGINE_H\n#define INFERENCE_ENGINE_H\n\n#include <Arduino.h>\n\n// @implements FA2.2, FA2.3\nbool runModelInference(float* buffer, String& outLabel, float& outConfidence, float& outAnomaly);\n\n#endif // INFERENCE_ENGINE_H\n",
    "app/components/sensor_card/architecture.md": "<!--\nC4-Ebene: Component\nDeployable: Nein\n-->\n\n# SensorCard UI-Komponente\n\nDiese Komponente ermöglicht dem Benutzer das Scannen nach MoveLink-Sensoren und das Herstellen/Trennen der Bluetooth-Verbindung.\n\n## C4-Architektur-Ebene\n* **C4-Ebene:** Component\n* **Deployable:** Nein (Läuft als Teil des Mobile App Containers)\n\n## Beschreibung\nDie SensorCard stellt ein gläsernes Benutzeroberflächenelement bereit, das den aktuellen Bluetooth-Verbindungsstatus (getrennt, verbindend, verbunden) anzeigt. Sie steuert den Scanvorgang und erlaubt es, ein aktives Pairing durchzuführen oder zu beenden.\n\n## Requirements\n\n**FA1.2**: Die App ermöglicht das Scannen nach verfügbaren Bluetooth-Sensorgeräten.\n**FA1.3**: Die App baut eine stabile Bluetooth-Verbindung zum Sensor auf.\n**NF3**: Das Bluetooth-Pairing mit dem Sensor darf maximal zwei manuelle Interaktionen erfordern.\n\n## Datenfluss\n\n```mermaid\nflowchart LR\n    UI[SensorCard UI] -->|onScan / Klick| Hook[useBLE Hook]\n    Hook -->|Statusänderung| Store[useBLEStore]\n    Store -->|Reaktive Props| UI\n```\n",
    "embedded/src/components/ble_streamer/BLEStreamer.cpp": "// @implements FA2.5\n#include \"BLEStreamer.h\"\n#include <ArduinoBLE.h>\n\nstatic BLEService imuService(\"12345678-1234-1234-1234-123456789012\");\nstatic BLECharacteristic imuCharacteristic(\"12345678-1234-1234-1234-123456789013\", BLERead | BLENotify, 24);\nstatic BLECharacteristic inferenceCharacteristic(\"12345678-1234-1234-1234-123456789014\", BLERead | BLENotify, 128);\n\nbool initBLE() {\n    if (!BLE.begin()) {\n        Serial.println(\"Starting BLE failed!\");\n        return false;\n    }\n    \n    BLE.setLocalName(\"MoveLink Sensor\");\n    BLE.setAdvertisedService(imuService);\n    \n    // Setze ein schnelles Verbindungsintervall (10ms - 20ms) um Latenz zu verhindern\n    BLE.setConnectionInterval(8, 16); \n    \n    imuService.addCharacteristic(imuCharacteristic);\n    imuService.addCharacteristic(inferenceCharacteristic);\n    BLE.addService(imuService);\n    \n    // Initial data: 6 floats (24 bytes) all set to 0.0f\n    float initialData[6] = {0.0f, 0.0f, 0.0f, 0.0f, 0.0f, 0.0f};\n    imuCharacteristic.writeValue((uint8_t*)initialData, 24);\n    inferenceCharacteristic.writeValue(\"{}\");\n    \n    BLE.advertise();\n    Serial.println(\"BLE advertising started.\");\n    return true;\n}\n\nvoid streamIMUData(float ax, float ay, float az, float gx, float gy, float gz) {\n    BLE.poll();\n    if (isBLEConnected()) {\n        float packet[6] = {ax, ay, az, gx, gy, gz};\n        imuCharacteristic.writeValue((uint8_t*)packet, 24);\n    }\n}\n\nvoid streamInferenceResult(const String& label, float confidence, float anomaly, const String& tipp) {\n    BLE.poll();\n    if (isBLEConnected()) {\n        String json = \"{\\\"label\\\":\\\"\" + label + \"\\\",\\\"conf\\\":\" + String(confidence, 2) + \",\\\"anomaly\\\":\" + String(anomaly, 3) + \",\\\"tipp\\\":\\\"\" + tipp + \"\\\"}\";\n        inferenceCharacteristic.writeValue(json.c_str());\n    }\n}\n\nvoid pollBLE() {\n    BLE.poll();\n}\n\nbool isBLEConnected() {\n    BLEDevice central = BLE.central();\n    return (central && central.connected());\n}\n",
    "embedded/src/components/sensordatenerfassung/IMUReader.cpp": "// @implements FA2.1, NF1\n#include \"IMUReader.h\"\n#include <LSM6DS3.h>\n#include <Wire.h>\n\n#define CONVERT_G_TO_MS2    9.80665f\n#define MAX_ACCEPTED_RANGE  2.0f\n\nstatic LSM6DS3 myIMU(I2C_MODE, 0x6A);\n\nstatic float ei_get_sign(float number) {\n    return (number >= 0.0) ? 1.0 : -1.0;\n}\n\n// @implements FA2.1, NF1\nbool initIMU() {\n    return myIMU.begin();\n}\n\n// @implements FA2.1, NF1\nvoid readSensorData(float* buffer, size_t startIndex) {\n\n    // 1. Beschleunigung einlesen\n    // @implements FA2.1\n    buffer[startIndex + 0] = myIMU.readFloatAccelX();\n    buffer[startIndex + 1] = myIMU.readFloatAccelY();\n    buffer[startIndex + 2] = myIMU.readFloatAccelZ();\n\n    // 2. Gyroskop einlesen\n    // @implements FA2.1\n    buffer[startIndex + 3] = myIMU.readFloatGyroX();\n    buffer[startIndex + 4] = myIMU.readFloatGyroY();\n    buffer[startIndex + 5] = myIMU.readFloatGyroZ();\n\n    // Clamping & Umrechnung nur für die Beschleunigungs-Achsen (Index 0 bis 2)\n    for (int i = 0; i < 3; i++) {\n        if (fabs(buffer[startIndex + i]) > MAX_ACCEPTED_RANGE) {\n            buffer[startIndex + i] = ei_get_sign(buffer[startIndex + i]) * MAX_ACCEPTED_RANGE;\n        }\n        buffer[startIndex + i] *= CONVERT_G_TO_MS2;\n    }\n}\n",
    "embedded/src/components/led_display_controller/architecture.md": "<!--\nC4-Ebene: Component\nDeployable: Nein\nfullfills: FA2.4\n-->\n\n# LED- & Display-Controller\n\nDiese Komponente gibt dem Trainierenden direktes visuelles Feedback zur Qualität und dem Typ der Übungsausführung über die integrierte RGB-LED.\n\n## C4-Architektur-Ebene\n* **C4-Ebene:** Component\n* **Deployable:** Nein (Läuft als Teil des Sensor Firmware Containers)\n\n## Beschreibung\nDer Controller steuert die integrierten Low-Active RGB-LEDs des XIAO-Boards (Pins `LEDR`, `LEDB` und `LEDG`) basierend auf den Klassifikationsergebnissen der Inferenz-Engine. Das ursprüngliche OLED-Display (U8x8) wurde aus Designgründen entfernt, um Gewicht und Energiebedarf einzusparen.\n\n### Feedback-Logik\n- **Warte auf Bluetooth-Verbindung (kein BLE verbunden):**\n  - RGB-LED: **Langsames Blinken (Blau)** (Pin `LEDB` blinkt an/aus)\n- **Ruhemodus (`idle` oder Konfidenz < 60%):**\n  - RGB-LED: **Blau** (Pin `LEDB` auf LOW)\n- **Schulterdrücken (`ShoulderPress`):**\n  - RGB-LED: **Magenta/Lila** (Pins `LEDR` und `LEDB` auf LOW)\n- **Seitheben (`lateralraise` / `LateralRaise` / `LateralRaises`):**\n  - RGB-LED: **Türkis** (Pins `LEDB` und `LEDG` auf LOW)\n- **Saubere Ausführung Bizeps-Curl (`curl` / `curl_sauber`):**\n  - RGB-LED: **Grün** (Pin `LEDG` auf LOW)\n- **Fehlerhafte Ausführung / Sonstiges (z. B. `fehler_rotation`, `fehler_ellbogen`):**\n  - RGB-LED: **Rot** (Pin `LEDR` auf LOW)\n\n## Requirements\n\n**FA2.4**: Das Gerät gibt durch die LED den Verbindungsstatus aus.\n**FA2.4.1**: Ansteuerung der RGB-LED zur Signalisierung von Fehlern (Rot), perfekten Curls (Grün), Seitheben (Türkis), Schulterdrücken (Lila) und Idle/Verbindungsaufbau (Blau).\n\n## Kontrollfluss\n\n```mermaid\nflowchart TD\n    Result[Inferenz-Ergebnis] --> Check{Welche Klasse?}\n    Check -->|idle / <60%| Idle[Blau leuchten]\n    Check -->|ShoulderPress| Shoulder[Magenta/Lila leuchten]\n    Check -->|lateralraise| Lateral[Türkis leuchten]\n    Check -->|curl_sauber| Perfect[Grün leuchten]\n    Check -->|Fehlerklasse / Unbekannt| Error[Rot leuchten]\n```\n",
    "app/architecture.md": "# MoveLink Mobile App - Container-Architektur\n\nDieses Dokument beschreibt die Mobile App als eigenständige, deploybare Einheit im C4-Modell.\n\n## C4-Architektur-Ebene\n* **C4-Ebene:** Container\n* **Deployable:** Ja\n* **Deployment-Artefakt:** Android Package (.apk) / iOS IPA\n* **Technologie-Stack:** React Native, Expo, TypeScript, Zustand, BLE PLX\n\n## Beschreibung\nDie MoveLink Mobile App ist die primäre Benutzerschnittstelle des Systems. Sie läuft auf Android- und iOS-Endgeräten und verbindet sich über Bluetooth Low Energy (BLE) mit dem embedded Sensor-Gerät, um Bewegungsdaten in Echtzeit zu erfassen, zu visualisieren und zur persistenten Speicherung an das Backend zu übertragen.\n\n```mermaid\nflowchart TD\n    User[Trainierender] -->|Interagiert mit| App[React Native App Container]\n    App -->|BLE Bluetooth| Sensor[Sensor Firmware Container]\n    App -->|REST/WebSockets| Backend[Backend API Container]\n```\n\n## Requirements\n\n**FA1.1**: Die App bietet eine Navigationsstruktur (Reiter/Menü) für Hardwaregeräte, Trainings und vergangene Einheiten.\n**FA1.1.1**: Die App bietet eine Seiten-Navigation (Drawer/SideNav) auf Tablets und Web.\n**FA1.1.2**: Die App bietet eine untere Tableiste (Tabs) auf Mobiltelefonen.\n**FA1.2**: Die App ermöglicht das Scannen nach verfügbaren Bluetooth-Sensorgeräten.\n**FA1.3**: Die App baut eine stabile Bluetooth-Verbindung zum Sensor auf.\n**FA1.4**: Die App demonstriert grafisch die auszuführende Übungsausführung (z. B. via Lottie-Animation).\n**FA1.5**: Die App visualisiert die empfangenen Sensordaten und den Übungsfortschritt in Echtzeit.\n**FA1.6**: Die App zeigt historische Trainingseinheiten grafisch und statistisch an.\n**FA1.7**: Die App zeigt Profildetails des Benutzers an.\n\n\n## Komponenten in diesem Container\nDie App enthält mehrere Komponenten (C4-Komponenten-Ebene):\n1. **[SideNav](file:///home/arch/repo/movelink/app/components/side_nav/SideNav.tsx)**: Navigationskomponente für die App-Steuerung. (Erfüllt: FA1.1, FA1.1.1)\n2. **[SensorCard](file:///home/arch/repo/movelink/app/components/sensor_card/SensorCard.tsx)**: Verwaltung der BLE-Geräteverbindung und Pairing. (Erfüllt: FA1.2, FA1.3, NF3)\n3. **[LiveChart](file:///home/arch/repo/movelink/app/components/live_chart/LiveChart.tsx)**: Echtzeit-Visualisierung der IMU-Beschleunigungs- und Gyroskopwerte. (Erfüllt: FA1.5)\n4. **[SessionCard](file:///home/arch/repo/movelink/app/components/session_card/SessionCard.tsx)**: Visualisierung historischer Trainingseinheiten. (Erfüllt: FA1.6)\n5. **[BLE-Hook (useBLE)](file:///home/arch/repo/movelink/app/hooks/useBLE.ts)**: Kapselt die Bluetooth-Gerätekommunikation und den Reconnect. (Erfüllt: FA1.3, NF2)\n6. **[ProfileCard](file:///home/arch/repo/movelink/app/components/ProfileCard/architecture.md)**: Visualisierung der Benutzerprofildetails. (Erfüllt: FA1.7)\n",
    "app/components/live_chart/architecture.md": "<!--\nC4-Ebene: Component\nDeployable: Nein\n-->\n\n# LiveChart UI-Komponente\n\nDiese Komponente zeichnet eintreffende 6-Achsen-Messwerte der Sensordatenerfassung in Echtzeit auf einem grafischen Canvas.\n\n## C4-Architektur-Ebene\n* **C4-Ebene:** Component\n* **Deployable:** Nein (Läuft als Teil des Mobile App Containers)\n\n## Beschreibung\nDie LiveChart visualisiert den Kurvenverlauf der Beschleunigung (X, Y, Z) und optional des Gyroskops (X, Y, Z) in Echtzeit. Sie erhält kontinuierlich Updates vom BLE-Datenstrom und zeichnet diese flüssig als SVG-Pfade, um eine Latenz unterhalb der Akzeptanzgrenze (NF1) zu garantieren.\n\n## Requirements\n\n**FA1.5**: Die App visualisiert die empfangenen Sensordaten und den Übungsfortschritt in Echtzeit.\n**NF1**: Die End-to-End-Latenz von der physischen Sensorbewegung bis zur visuellen Darstellung in der App muss ≤ 100 ms sein.\n\n## Datenfluss\n\n```mermaid\nflowchart LR\n    BLE[useBLE Hook] -->|Neue IMU-Werte| Store[useBLEStore]\n    Store -->|latestReading| Screen[Training Screen]\n    Screen -->|Datenpuffer (Buffer)| Chart[LiveChart Component]\n    Chart -->|SVG Render| Canvas[Bildschirm-Anzeige]\n```\n",
    "app/components/live_chart/LiveChart.tsx": "/**\n * @implements FA1.5\n */\nimport React, { useMemo, useState } from 'react';\nimport { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';\nimport Svg, { Path, Polyline, Line, Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';\nimport { FadeSlide } from '@/components/FadeSlide';\nimport { GlassCard } from '@/components/GlassCard';\nimport { Colors } from '@/constants/Colors';\nimport { IMUReading } from '@/store';\n\ntype Mode = 'accel' | 'gyro';\n\ninterface Props {\n  data: IMUReading[];\n}\n\nconst PAD = { l: 38, r: 10, t: 12, b: 20 };\nconst HEIGHT = 170;\n\nconst MODES: { key: Mode; label: string }[] = [\n  { key: 'accel', label: 'Accelerometer' },\n  { key: 'gyro', label: 'Gyroskop' },\n];\n\nconst SERIES = {\n  accel: [\n    { field: 'accelX' as keyof IMUReading, color: Colors.accentX, label: 'X' },\n    { field: 'accelY' as keyof IMUReading, color: Colors.accentY, label: 'Y' },\n    { field: 'accelZ' as keyof IMUReading, color: Colors.accentZ, label: 'Z' },\n  ],\n  gyro: [\n    { field: 'gyroX' as keyof IMUReading, color: Colors.accentX, label: 'X' },\n    { field: 'gyroY' as keyof IMUReading, color: Colors.accentY, label: 'Y' },\n    { field: 'gyroZ' as keyof IMUReading, color: Colors.accentZ, label: 'Z' },\n  ],\n};\n\nfunction buildPaths(data: IMUReading[], fields: (keyof IMUReading)[], chartW: number, chartH: number) {\n  if (data.length < 2) return [];\n  const allVals = fields.flatMap((f) => data.map((r) => r[f] as number));\n  const min = Math.min(...allVals);\n  const max = Math.max(...allVals);\n  const range = max - min || 1;\n  const xStep = chartW / (data.length - 1);\n  const toY = (v: number) => chartH - ((v - min) / range) * chartH;\n\n  return fields.map((field) => {\n    const pts = data.map((r, i) => ({ x: i * xStep, y: toY(r[field] as number) }));\n    const lineStr = pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');\n    const first = pts[0];\n    const last = pts[pts.length - 1];\n    const areaStr = `M ${first.x.toFixed(1)},${chartH} L ${lineStr.split(' ').join(' L ')} L ${last.x.toFixed(1)},${chartH} Z`;\n    return { line: lineStr, area: areaStr };\n  });\n}\n\nfunction offsetPoints(str: string, dx: number, dy: number): string {\n  return str.split(' ').map((token) => {\n    if (['M', 'L', 'Z'].includes(token)) return token;\n    const [x, y] = token.split(',').map(Number);\n    return `${(x + dx).toFixed(1)},${(y + dy).toFixed(1)}`;\n  }).join(' ');\n}\n\nexport function LiveChart({ data }: Props) {\n  const [mode, setMode] = useState<Mode>('accel');\n  const [modeKey, setModeKey] = useState(0);\n  const screenW = Dimensions.get('window').width;\n  const chartW = screenW - 32 - PAD.l - PAD.r;\n  const chartH = HEIGHT - PAD.t - PAD.b;\n\n  const series = SERIES[mode];\n  const paths = useMemo(\n    () => buildPaths(data, series.map((s) => s.field), chartW, chartH),\n    [data, mode, chartW, chartH]\n  );\n\n  const hasData = data.length >= 2;\n  const allVals = hasData ? series.flatMap((s) => data.map((r) => r[s.field] as number)) : [0, 1];\n  const minVal = Math.min(...allVals);\n  const maxVal = Math.max(...allVals);\n\n  function switchMode(m: Mode) {\n    setMode(m);\n    setModeKey((k) => k + 1);\n  }\n\n  return (\n    <GlassCard style={styles.card}>\n      <View style={styles.toggle}>\n        {MODES.map(({ key, label }) => (\n          <TouchableOpacity\n            key={key}\n            onPress={() => switchMode(key)}\n            style={[styles.toggleBtn, mode === key && styles.toggleBtnActive]}\n            activeOpacity={0.7}\n          >\n            <Text style={[styles.toggleText, mode === key && styles.toggleTextActive]}>\n              {label}\n            </Text>\n          </TouchableOpacity>\n        ))}\n      </View>\n\n      {!hasData ? (\n        <View style={[styles.empty, { height: HEIGHT }]}>\n          <Text style={styles.emptyText}>Warte auf Sensordaten…</Text>\n        </View>\n      ) : (\n        <FadeSlide key={modeKey} from={{ opacity: 0, translateY: 0 }} delay={0}>\n          <Svg width={screenW - 32} height={HEIGHT}>\n            <Defs>\n              {series.map((s, i) => (\n                <LinearGradient key={i} id={`g${i}_${mode}`} x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\">\n                  <Stop offset=\"0%\" stopColor={s.color} stopOpacity=\"0.22\" />\n                  <Stop offset=\"100%\" stopColor={s.color} stopOpacity=\"0\" />\n                </LinearGradient>\n              ))}\n            </Defs>\n\n            <SvgText x={PAD.l - 4} y={PAD.t + 8} fill={Colors.textSub} fontSize=\"9\" textAnchor=\"end\">\n              {maxVal.toFixed(1)}\n            </SvgText>\n            <SvgText x={PAD.l - 4} y={PAD.t + chartH} fill={Colors.textSub} fontSize=\"9\" textAnchor=\"end\">\n              {minVal.toFixed(1)}\n            </SvgText>\n\n            <Line x1={PAD.l} y1={PAD.t} x2={PAD.l} y2={PAD.t + chartH} stroke={Colors.border} strokeWidth={1} />\n            <Line x1={PAD.l} y1={PAD.t + chartH} x2={PAD.l + chartW} y2={PAD.t + chartH} stroke={Colors.border} strokeWidth={1} />\n            <Line x1={PAD.l} y1={PAD.t + chartH / 2} x2={PAD.l + chartW} y2={PAD.t + chartH / 2} stroke={Colors.border} strokeWidth={1} strokeDasharray=\"3,4\" />\n\n            {paths.map((p, i) => (\n              <React.Fragment key={i}>\n                <Path d={offsetPoints(p.area, PAD.l, PAD.t)} fill={`url(#g${i}_${mode})`} />\n                <Polyline\n                  points={p.line.split(' ').map((pt) => {\n                    const [x, y] = pt.split(',').map(Number);\n                    return `${(x + PAD.l).toFixed(1)},${(y + PAD.t).toFixed(1)}`;\n                  }).join(' ')}\n                  fill=\"none\"\n                  stroke={series[i].color}\n                  strokeWidth={1.8}\n                  strokeLinejoin=\"round\"\n                  strokeLinecap=\"round\"\n                />\n              </React.Fragment>\n            ))}\n          </Svg>\n        </FadeSlide>\n      )}\n\n      <View style={styles.legend}>\n        {series.map((s) => (\n          <View key={s.label} style={styles.legendItem}>\n            <View style={[styles.legendDot, { backgroundColor: s.color }]} />\n            <Text style={styles.legendText}>{s.label}</Text>\n          </View>\n        ))}\n      </View>\n    </GlassCard>\n  );\n}\n\nconst styles = StyleSheet.create({\n  card: { padding: 14, gap: 8 },\n  toggle: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 10, padding: 3, gap: 3 },\n  toggleBtn: { flex: 1, paddingVertical: 7, borderRadius: 8, alignItems: 'center' },\n  toggleBtnActive: { backgroundColor: Colors.surfaceBright },\n  toggleText: { color: Colors.textSub, fontSize: 12, fontWeight: '600' },\n  toggleTextActive: { color: Colors.text },\n  empty: { alignItems: 'center', justifyContent: 'center' },\n  emptyText: { color: Colors.textMuted, fontSize: 13 },\n  legend: { flexDirection: 'row', gap: 16 },\n  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },\n  legendDot: { width: 7, height: 7, borderRadius: 3.5 },\n  legendText: { color: Colors.textSub, fontSize: 11, fontWeight: '500' },\n});\n",
    "app/hooks/useWebSocket.ts": "/**\n * @implements FA1.5\n */\nimport { useEffect, useRef, useCallback } from 'react';\nimport { useBLEStore, useTrainingStore } from '@/store';\n\n// Backend WebSocket URL — served by AP2 (Luca Schöneberg) via Docker\nconst WS_URL = process.env.EXPO_PUBLIC_WS_URL ?? 'ws://localhost:3000/ws';\nconst RECONNECT_DELAY_MS = 3000;\n\nexport function useWebSocket() {\n  const ws = useRef<WebSocket | null>(null);\n  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);\n  const shouldReconnect = useRef(true);\n\n  const latestReading = useBLEStore((s) => s.latestReading);\n  const { isRecording, sessionId } = useTrainingStore();\n\n  const connect = useCallback(() => {\n    if (ws.current?.readyState === WebSocket.OPEN) return;\n    ws.current = new WebSocket(WS_URL);\n\n    ws.current.onopen = () => {\n      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);\n    };\n\n    ws.current.onclose = () => {\n      if (!shouldReconnect.current) return;\n      reconnectTimer.current = setTimeout(connect, RECONNECT_DELAY_MS);\n    };\n\n    ws.current.onerror = () => {\n      ws.current?.close();\n    };\n  }, []);\n\n  const disconnect = useCallback(() => {\n    shouldReconnect.current = false;\n    if (reconnectTimer.current) clearTimeout(reconnectTimer.current);\n    ws.current?.close();\n  }, []);\n\n  // Forward every new BLE reading to the backend while a session is active\n  useEffect(() => {\n    if (!isRecording || !latestReading || ws.current?.readyState !== WebSocket.OPEN) return;\n    ws.current.send(JSON.stringify({ sessionId, reading: latestReading }));\n  }, [latestReading, isRecording, sessionId]);\n\n  useEffect(() => {\n    shouldReconnect.current = true;\n    connect();\n    return () => { disconnect(); };\n  }, []);\n\n  return { connect, disconnect };\n}\n",
    "app/store/index.ts": "/**\n * @implements FA1.5, FA1.6\n */\nimport { create } from 'zustand';\nimport { Platform } from 'react-native';\nimport * as Haptics from 'expo-haptics';\nimport AsyncStorage from '@react-native-async-storage/async-storage';\n\nexport type ConnectionStatus = 'idle' | 'scanning' | 'connecting' | 'connected' | 'disconnected' | 'error';\nexport type TrainingStatus = 'idle' | 'preparing' | 'recording';\nexport type ExerciseState = 'start' | 'moving' | 'peak' | 'returning';\nexport type ExerciseType = 'squat' | 'curl';\n\nexport interface IMUReading {\n  timestamp: number;\n  accelX: number;\n  accelY: number;\n  accelZ: number;\n  gyroX: number;\n  gyroY: number;\n  gyroZ: number;\n}\n\nexport interface RecordedInference {\n  timestamp: number;\n  label: string;\n  confidence: number;\n  anomaly: number;\n  tipp: string;\n}\n\nexport interface TrainingSession {\n  id: string;\n  startedAt: string;\n  endedAt: string | null;\n  durationSeconds: number;\n  readingCount: number;\n  inferences?: RecordedInference[];\n}\n\n// Max data points kept in-memory for the live chart (rolling buffer)\nconst LIVE_BUFFER_SIZE = 100;\n\nexport const EXERCISE_TARGETS: Record<ExerciseType, number> = {\n  squat: 70, // 70 Grad Kniebeuge-Tiefe\n  curl: 90,  // 90 Grad Ellenbogenbeugung\n};\n\n// Filter states (keep outside Zustand state to prevent React render storms on raw intermediate numbers)\nlet lastTimestamp = 0;\nlet filteredAngle = 0;\n\ninterface BLEStore {\n  status: ConnectionStatus;\n  deviceId: string | null;\n  deviceName: string | null;\n  latestReading: IMUReading | null;\n  isDemoMode: boolean;\n  inferenceLabel: string | null;\n  inferenceConfidence: number | null;\n  inferenceAnomaly: number | null;\n  inferenceTipp: string | null;\n  setStatus: (status: ConnectionStatus) => void;\n  setDevice: (id: string, name: string) => void;\n  setReading: (reading: IMUReading) => void;\n  setDemoMode: (isDemoMode: boolean) => void;\n  setInference: (label: string, confidence: number, anomaly: number, tipp: string) => void;\n  disconnect: () => void;\n}\n\ninterface TrainingStore {\n  isRecording: boolean;\n  sessionId: string | null;\n  liveBuffer: IMUReading[];\n  sessions: TrainingSession[];\n  recordedInferences: RecordedInference[];\n  \n  // New interactive training states\n  status: TrainingStatus;\n  exercise: ExerciseType;\n  exerciseState: ExerciseState;\n  repCount: number;\n  currentAngle: number;\n  countdown: number;\n  \n  // Existing and new actions\n  startSession: () => void;\n  stopSession: () => void;\n  startTraining: (exercise: ExerciseType) => void;\n  stopTraining: () => void;\n  setCountdown: (countdown: number) => void;\n  addReading: (reading: IMUReading) => void;\n  setSessions: (sessions: TrainingSession[]) => void;\n  resetTraining: () => void;\n  addInference: (inference: Omit<RecordedInference, 'timestamp'>) => void;\n}\n\nexport const useBLEStore = create<BLEStore>((set) => ({\n  status: 'idle',\n  deviceId: null,\n  deviceName: null,\n  latestReading: null,\n  isDemoMode: false,\n  inferenceLabel: null,\n  inferenceConfidence: null,\n  inferenceAnomaly: null,\n  inferenceTipp: null,\n  setStatus: (status) => set({ status }),\n  setDevice: (deviceId, deviceName) => set({ deviceId, deviceName }),\n  setReading: (reading) => set({ latestReading: reading }),\n  setDemoMode: (isDemoMode) => set({ isDemoMode }),\n  setInference: (inferenceLabel, inferenceConfidence, inferenceAnomaly, inferenceTipp) => set({ inferenceLabel, inferenceConfidence, inferenceAnomaly, inferenceTipp }),\n  disconnect: () => set({ status: 'disconnected', deviceId: null, deviceName: null, latestReading: null, inferenceLabel: null, inferenceConfidence: null, inferenceAnomaly: null, inferenceTipp: null }),\n}));\n\nexport const useTrainingStore = create<TrainingStore>((set) => ({\n  isRecording: false,\n  sessionId: null,\n  liveBuffer: [],\n  sessions: [],\n  recordedInferences: [],\n  \n  // Default interactive states\n  status: 'idle',\n  exercise: 'squat',\n  exerciseState: 'start',\n  repCount: 0,\n  currentAngle: 0,\n  countdown: 3,\n\n  startSession: () => {\n    console.log(\"store: startSession action triggered\");\n    // Reset filters\n    lastTimestamp = 0;\n    filteredAngle = 0;\n    \n    set({ \n      isRecording: true, \n      sessionId: Date.now().toString(), \n      liveBuffer: [],\n      recordedInferences: [],\n      status: 'recording',\n      repCount: 0,\n      currentAngle: 0,\n      exerciseState: 'start',\n    });\n  },\n\n  stopSession: () => {\n    console.log(\"store: stopSession action triggered\");\n    set((state) => {\n      const newSession: TrainingSession = {\n        id: state.sessionId || Date.now().toString(),\n        startedAt: new Date(Date.now() - state.liveBuffer.length * 20).toISOString(),\n        endedAt: new Date().toISOString(),\n        durationSeconds: Math.round(state.liveBuffer.length * 0.02), // 50Hz assumed\n        readingCount: state.liveBuffer.length,\n        inferences: [...state.recordedInferences],\n      };\n\n      const updatedSessions = [newSession, ...state.sessions];\n      console.log(\"store: saving updated sessions list locally, count:\", updatedSessions.length);\n      AsyncStorage.setItem('movelink_sessions', JSON.stringify(updatedSessions))\n        .catch((err) => console.error('Error saving sessions locally:', err));\n\n      return {\n        isRecording: false,\n        sessionId: null,\n        status: 'idle',\n        sessions: updatedSessions,\n      };\n    });\n  },\n\n  startTraining: (exercise: ExerciseType) => {\n    console.log(\"store: startTraining action triggered with exercise:\", exercise);\n    set({\n      status: 'preparing',\n      exercise,\n      repCount: 0,\n      currentAngle: 0,\n      exerciseState: 'start',\n      countdown: 3,\n    });\n  },\n\n  stopTraining: () => {\n    const { stopSession } = useTrainingStore.getState();\n    stopSession();\n  },\n\n  setCountdown: (countdown: number) => set({ countdown }),\n\n  resetTraining: () => {\n    set({\n      status: 'idle',\n      repCount: 0,\n      currentAngle: 0,\n      exerciseState: 'start',\n      isRecording: false,\n      sessionId: null,\n    });\n  },\n\n  addReading: (reading) => {\n    set((state) => {\n      // 1. Process complementary filter\n      const ax = reading.accelX;\n      const ay = reading.accelY;\n      const az = reading.accelZ;\n\n      // Winkel aus Beschleunigungsmesser berechnen (in Grad)\n      const accelAngle = Math.atan2(ay, Math.sqrt(ax * ax + az * az)) * (180 / Math.PI);\n      \n      // Winkelgeschwindigkeit (rad/s in deg/s umrechnen)\n      const gyroRate = reading.gyroX * (180 / Math.PI);\n\n      const now = reading.timestamp;\n      if (lastTimestamp === 0) {\n        filteredAngle = accelAngle;\n      } else {\n        const dt = (now - lastTimestamp) / 1000; // Zeitdifferenz in Sekunden\n        const alpha = 0.96;\n        filteredAngle = alpha * (filteredAngle + gyroRate * dt) + (1 - alpha) * accelAngle;\n      }\n      lastTimestamp = now;\n\n      // Winkel normalisieren (absoluten Betrag nehmen)\n      const angle = Math.min(180, Math.max(0, Math.abs(filteredAngle)));\n\n      // 2. FSM (Finite State Machine) für Wiederholungsvergleich\n      const target = EXERCISE_TARGETS[state.exercise];\n      let nextExState = state.exerciseState;\n      let nextRepCount = state.repCount;\n\n      if (state.exerciseState === 'start') {\n        if (angle > 20) {\n          nextExState = 'moving';\n        }\n      } else if (state.exerciseState === 'moving') {\n        if (angle >= target) {\n          nextExState = 'peak';\n          // Erfolgs-Vibration bei Erreichen des Zielwinkels\n          if (Platform.OS !== 'web') {\n            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});\n          }\n        }\n      } else if (state.exerciseState === 'peak') {\n        if (angle < target - 8) {\n          nextExState = 'returning';\n        }\n      } else if (state.exerciseState === 'returning') {\n        if (angle < 15) {\n          nextExState = 'start';\n          nextRepCount += 1;\n          // Kurze Bestätigungs-Vibration für vollendete Wiederholung\n          if (Platform.OS !== 'web') {\n            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});\n          }\n        }\n      }\n\n      return {\n        currentAngle: parseFloat(angle.toFixed(1)),\n        exerciseState: nextExState,\n        repCount: nextRepCount,\n        liveBuffer:\n          state.liveBuffer.length >= LIVE_BUFFER_SIZE\n            ? [...state.liveBuffer.slice(1), reading]\n            : [...state.liveBuffer, reading],\n      };\n    });\n  },\n\n  setSessions: (sessions) => set({ sessions }),\n\n  addInference: (inference) => {\n    set((state) => ({\n      recordedInferences: [\n        ...state.recordedInferences,\n        { ...inference, timestamp: Date.now() },\n      ],\n    }));\n  },\n}));\n",
    "app/app/(tabs)/index.tsx": "/**\n * @implements FA1.1, FA1.4, FA1.5\n */\nimport React, { useState, useEffect, useRef } from 'react';\nimport { View, Text, ScrollView, StyleSheet, SafeAreaView, StatusBar, Platform, TouchableOpacity } from 'react-native';\nimport Animated, {\n  useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming,\n} from 'react-native-reanimated';\nimport { LinearGradient } from 'expo-linear-gradient';\nimport * as Haptics from 'expo-haptics';\nimport { Colors } from '@/constants/Colors';\nimport { useBLEStore, useTrainingStore, EXERCISE_TARGETS, ExerciseType, IMUReading } from '@/store';\nimport { useBLE } from '@/hooks/useBLE';\nimport { useWebSocket } from '@/hooks/useWebSocket';\nimport { SensorCard } from '@/components/sensor_card/SensorCard';\nimport { LiveChart } from '@/components/live_chart/LiveChart';\nimport { AnimatedValue } from '@/components/AnimatedValue';\nimport { GradientButton } from '@/components/GradientButton';\nimport { FadeSlide } from '@/components/FadeSlide';\nimport { AnimatedLogo } from '@/components/AnimatedLogo';\nimport { GlassCard } from '@/components/GlassCard';\nimport { ExerciseDemo } from '@/components/ExerciseDemo';\nimport { ProgressRing } from '@/components/ProgressRing';\n\nfunction RecBadge() {\n  return (\n    <View style={styles.recBadge}>\n      <View style={styles.recDot} />\n      <Text style={styles.recLabel}>REC</Text>\n    </View>\n  );\n}\n\nexport function formatMovementLabel(label: string | null): string {\n  if (!label) return 'Bereit';\n  const lowerLabel = label.toLowerCase().replace(/_/g, '').trim();\n  if (lowerLabel === 'idle') return 'Bereit';\n  if (lowerLabel === 'curl') return 'Bizeps-Curl';\n  if (lowerLabel === 'lateralraise' || lowerLabel === 'lateralraises') return 'Seitheben';\n  if (lowerLabel === 'shoulderpress') return 'Schulterdrücken';\n  return label;\n}\n\nexport function getAnomalyColor(score: number | null): string {\n  if (score === null) return Colors.textSub;\n  if (score < 1.0) return Colors.connected; // Green (Sehr Gut)\n  if (score < 2.2) return Colors.warning;   // Yellow (Mäßig)\n  return Colors.error;                     // Red (Schlecht)\n}\n\nexport function getAnomalyLabel(score: number | null): string {\n  if (score === null) return 'Keine Messung';\n  if (score < 1.0) return 'Hervorragende Ausführung';\n  if (score < 2.2) return 'Mäßige Ausführung';\n  return 'Unregelmäßige Ausführung';\n}\n\nexport default function TrainingScreen() {\n  const { status: bleStatus, deviceName, latestReading, inferenceLabel, inferenceConfidence, inferenceAnomaly, inferenceTipp } = useBLEStore();\n  const { \n    status: trainingStatus,\n    exercise,\n    exerciseState,\n    repCount,\n    currentAngle,\n    countdown,\n    isRecording,\n    liveBuffer,\n    startTraining,\n    stopTraining,\n    resetTraining,\n    setCountdown,\n    startSession\n  } = useTrainingStore();\n  \n  const { startScan, disconnectDevice } = useBLE();\n  useWebSocket();\n\n  const [selectedEx, setSelectedEx] = useState<ExerciseType>('squat');\n\n  const isConnected = bleStatus === 'connected';\n\n  const handleStartTraining = React.useCallback(() => {\n    console.log(\"Training starten button clicked!\");\n    startSession();\n  }, [startSession]);\n\n  // Rolling buffer for live chart - updates in real-time when new reading is received\n  const IDLE_BUFFER_SIZE = 80;\n  const [idleChartData, setIdleChartData] = useState<IMUReading[]>([]);\n\n  useEffect(() => {\n    if (!isConnected || !latestReading) {\n      if (idleChartData.length > 0) setIdleChartData([]);\n      return;\n    }\n    setIdleChartData((prev) => {\n      // Prevents adding the exact same reading (e.g. if state updates multiple times)\n      if (prev.length > 0 && prev[prev.length - 1].timestamp === latestReading.timestamp) {\n        return prev;\n      }\n      return prev.length >= IDLE_BUFFER_SIZE\n        ? [...prev.slice(1), latestReading]\n        : [...prev, latestReading];\n    });\n  }, [latestReading, isConnected]);\n\n  // Countdown controller\n  useEffect(() => {\n    console.log(\"Countdown useEffect triggered, trainingStatus:\", trainingStatus);\n    if (trainingStatus !== 'preparing') return;\n    \n    console.log(\"Starting countdown preparing...\");\n    setCountdown(3);\n    const timer = setInterval(() => {\n      const currentVal = useTrainingStore.getState().countdown;\n      const nextVal = currentVal - 1;\n      console.log(\"Countdown tick:\", nextVal);\n      \n      if (nextVal <= 0) {\n        clearInterval(timer);\n        console.log(\"Countdown finished, calling startSession\");\n        if (Platform.OS !== 'web') {\n          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});\n        }\n        startSession();\n      } else {\n        setCountdown(nextVal);\n        if (Platform.OS !== 'web') {\n          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});\n        }\n      }\n    }, 1000);\n\n    return () => {\n      console.log(\"Clearing countdown timer\");\n      clearInterval(timer);\n    };\n  }, [trainingStatus]);\n\n  return (\n    <SafeAreaView style={styles.safe}>\n      <StatusBar barStyle=\"light-content\" backgroundColor={Colors.bg} />\n      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>\n\n        {/* Header */}\n        <FadeSlide delay={50}>\n          <View style={styles.headerRow}>\n            <AnimatedLogo />\n            {isRecording && <RecBadge />}\n          </View>\n          <Text style={styles.pageTitle}>Training</Text>\n        </FadeSlide>\n\n        {/* 1. BLE Connection Status (Always visible at top when not actively training) */}\n        {trainingStatus === 'idle' && (\n          <FadeSlide delay={100}>\n            <SensorCard status={bleStatus} deviceName={deviceName} onScan={startScan} onDisconnect={disconnectDevice} />\n          </FadeSlide>\n        )}\n\n        {/* 3. RECORDING STATE: Realtime Tracking and Anomaly Analysis */}\n        {isConnected && trainingStatus === 'recording' && (\n          <View style={styles.trackingContainer}>\n            <FadeSlide delay={100}>\n              <View style={styles.trackingHeader}>\n                <Text style={styles.trackingTitle}>Training läuft</Text>\n                <Text style={styles.trackingSub}>Echtzeit-Qualitätsanalyse aktiv</Text>\n              </View>\n            </FadeSlide>\n\n            <FadeSlide delay={150}>\n              <GlassCard style={styles.liveQualityCard}>\n                <Text style={styles.kiTitle}>Erkannte Bewegung</Text>\n                <Text style={styles.liveExerciseLabel}>\n                  {formatMovementLabel(inferenceLabel)}\n                </Text>\n                \n                <View style={styles.anomalySection}>\n                  <View style={styles.anomalyRow}>\n                    <Text style={styles.anomalyLabelText}>Anomalie-Score:</Text>\n                    <Text style={[styles.anomalyValueText, { color: getAnomalyColor(inferenceAnomaly) }]}>\n                      {inferenceAnomaly !== null ? inferenceAnomaly.toFixed(3) : '—'}\n                    </Text>\n                  </View>\n                  \n                  {inferenceAnomaly !== null && (\n                    <View style={styles.qualityBarBg}>\n                      <View \n                        style={[\n                          styles.qualityBarFill, \n                          { \n                            backgroundColor: getAnomalyColor(inferenceAnomaly),\n                            width: `${Math.min(100, Math.max(0, ((5 - inferenceAnomaly) / 6) * 100))}%`\n                          }\n                        ]} \n                      />\n                    </View>\n                  )}\n                  \n                  <Text style={[styles.qualityDescription, { color: getAnomalyColor(inferenceAnomaly) }]}>\n                    {getAnomalyLabel(inferenceAnomaly)}\n                  </Text>\n                </View>\n\n                {inferenceTipp ? (\n                  <View style={styles.kiFeedbackRow}>\n                    <Text style={styles.kiTippLabel}>Tipp:</Text>\n                    <Text style={styles.kiTippText}>{inferenceTipp}</Text>\n                  </View>\n                ) : null}\n              </GlassCard>\n            </FadeSlide>\n\n            {/* Optional Collapsible Diagnostic Raw Data */}\n            <FadeSlide delay={200}>\n              <LiveChart data={liveBuffer} />\n            </FadeSlide>\n\n            <FadeSlide delay={300}>\n              <GradientButton label=\"Training beenden\" variant=\"stop\" onPress={stopTraining} />\n            </FadeSlide>\n          </View>\n        )}\n\n        {/* 4. IDLE STATE: Exercise Selection & Start Trigger */}\n        {isConnected && trainingStatus === 'idle' && (\n          <View style={styles.idleActiveContainer}>\n            {/* Live Sensordaten (immer sichtbar wenn verbunden) */}\n            {latestReading && (\n              <FadeSlide delay={100}>\n                <Text style={styles.sectionLabel}>Live Sensordaten</Text>\n                <GlassCard style={styles.sensorLiveCard}>\n                  <Text style={styles.sensorGroupTitle}>Beschleunigung (m/s²)</Text>\n                  <View style={styles.grid}>\n                    <AnimatedValue label=\"X\" value={latestReading.accelX} unit=\"m/s²\" color={Colors.accentX} />\n                    <AnimatedValue label=\"Y\" value={latestReading.accelY} unit=\"m/s²\" color={Colors.accentY} />\n                    <AnimatedValue label=\"Z\" value={latestReading.accelZ} unit=\"m/s²\" color={Colors.accentZ} />\n                  </View>\n                  <Text style={[styles.sensorGroupTitle, { marginTop: 12 }]}>Gyroskop (rad/s)</Text>\n                  <View style={styles.grid}>\n                    <AnimatedValue label=\"X\" value={latestReading.gyroX} unit=\"rad/s\" color={Colors.accentX} />\n                    <AnimatedValue label=\"Y\" value={latestReading.gyroY} unit=\"rad/s\" color={Colors.accentY} />\n                    <AnimatedValue label=\"Z\" value={latestReading.gyroZ} unit=\"rad/s\" color={Colors.accentZ} />\n                  </View>\n                </GlassCard>\n              </FadeSlide>\n            )}\n\n            {/* Live Chart (rollendes Diagramm im Idle-Zustand) */}\n            <FadeSlide delay={110}>\n              <LiveChart data={idleChartData} />\n            </FadeSlide>\n\n            {!latestReading && (\n              <FadeSlide delay={100}>\n                <GlassCard style={styles.sensorLiveCard}>\n                  <Text style={styles.sensorWaiting}>Warte auf Sensordaten...</Text>\n                </GlassCard>\n              </FadeSlide>\n            )}\n\n            {/* Live KI-Erkennung vom Sensor-Chip */}\n            <FadeSlide delay={120}>\n              <Text style={styles.sectionLabel}>Live KI-Klassifizierung</Text>\n              <GlassCard style={styles.kiCard}>\n                <View style={styles.kiHeader}>\n                  <View style={styles.kiTitleGroup}>\n                    <Text style={styles.kiTitle}>Erkannte Bewegung</Text>\n                    <Text style={styles.kiLabel}>\n                      {formatMovementLabel(inferenceLabel)}\n                    </Text>\n                  </View>\n                  <View style={[\n                    styles.qualityBadge,\n                    {\n                      backgroundColor: !inferenceLabel || inferenceLabel.toLowerCase() === 'idle'\n                        ? 'rgba(77,140,124,0.1)'\n                        : ['curl', 'lateralraise', 'lateralraises', 'shoulderpress'].includes(inferenceLabel.toLowerCase()) || inferenceLabel.toLowerCase().includes('sauber')\n                          ? 'rgba(0,212,170,0.1)'\n                          : 'rgba(248,113,113,0.1)'\n                    }\n                  ]}>\n                    <Text style={[\n                      styles.qualityText,\n                      {\n                        color: !inferenceLabel || inferenceLabel.toLowerCase() === 'idle'\n                          ? Colors.textSub\n                          : ['curl', 'lateralraise', 'lateralraises', 'shoulderpress'].includes(inferenceLabel.toLowerCase()) || inferenceLabel.toLowerCase().includes('sauber')\n                            ? Colors.connected\n                            : Colors.error\n                      }\n                    ]}>\n                      {!inferenceLabel || inferenceLabel.toLowerCase() === 'idle'\n                        ? 'Bereit'\n                        : ['curl', 'lateralraise', 'lateralraises', 'shoulderpress'].includes(inferenceLabel.toLowerCase()) || inferenceLabel.toLowerCase().includes('sauber')\n                          ? 'Aktiv'\n                          : 'Korrektur noetig'}\n                    </Text>\n                  </View>\n                </View>\n\n                {inferenceTipp ? (\n                  <View style={styles.kiFeedbackRow}>\n                    <Text style={styles.kiTippLabel}>Tipp:</Text>\n                    <Text style={styles.kiTippText}>{inferenceTipp}</Text>\n                  </View>\n                ) : null}\n\n                {inferenceConfidence !== null && inferenceConfidence > 0 ? (\n                  <View style={styles.kiConfidenceRow}>\n                    <Text style={styles.kiConfidenceText}>\n                      Konfidenz: {(inferenceConfidence * 100).toFixed(0)}%\n                    </Text>\n                  </View>\n                ) : null}\n\n                {inferenceAnomaly !== null ? (\n                  <View style={styles.kiConfidenceRow}>\n                    <Text style={styles.kiConfidenceText}>\n                      Anomalie-Score: {inferenceAnomaly.toFixed(3)}\n                    </Text>\n                  </View>\n                ) : null}\n              </GlassCard>\n            </FadeSlide>\n\n            {/* Start Button */}\n            <FadeSlide delay={130}>\n              <GradientButton\n                label=\"Training starten\"\n                variant=\"primary\"\n                onPress={handleStartTraining}\n                style={{ marginTop: 8 }}\n              />\n            </FadeSlide>\n          </View>\n        )}\n\n        {/* 5. NO SENSOR CONNECTED HINT */}\n        {!isConnected && bleStatus === 'idle' && (\n          <FadeSlide delay={200}>\n            <LinearGradient\n              colors={['rgba(0,212,170,0.08)', 'transparent']}\n              style={styles.idleCard}\n            >\n              <Text style={styles.idleTitle}>Kein Sensor verbunden</Text>\n              <Text style={styles.idleBody}>\n                Schalte deinen XIAO nRF52840 ein und tippe oben auf \"Verbinden\".\n              </Text>\n            </LinearGradient>\n          </FadeSlide>\n        )}\n\n      </ScrollView>\n    </SafeAreaView>\n  );\n}\n\nconst styles = StyleSheet.create({\n  safe: { flex: 1, backgroundColor: 'transparent' },\n  scroll: { flex: 1 },\n  content: { padding: 20, gap: 14, paddingBottom: 40 },\n\n  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },\n  pageTitle: { color: Colors.text, fontSize: 30, fontWeight: '800', letterSpacing: -0.5, marginBottom: 4 },\n\n  recBadge: {\n    flexDirection: 'row', alignItems: 'center', gap: 6,\n    backgroundColor: Colors.primaryDim, borderRadius: 8,\n    paddingHorizontal: 10, paddingVertical: 5,\n    borderWidth: 1, borderColor: Colors.primaryGlow,\n  },\n  recDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary },\n  recLabel: { color: Colors.primary, fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },\n\n  readingsBlock: { gap: 10 },\n  sectionLabel: { color: Colors.textSub, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 },\n  grid: { flexDirection: 'row', gap: 8 },\n\n  idleCard: {\n    borderRadius: 20, padding: 32, alignItems: 'center', gap: 10,\n    borderWidth: 1, borderColor: Colors.border, marginTop: 16,\n  },\n  idleIcon: { fontSize: 40, marginBottom: 4 },\n  idleTitle: { color: Colors.text, fontSize: 17, fontWeight: '700', textAlign: 'center' },\n  idleBody: { color: Colors.textSub, fontSize: 13, textAlign: 'center', lineHeight: 20, maxWidth: 260 },\n\n  // Preparing State\n  preparingContainer: { gap: 16 },\n  countdownCard: { padding: 24, alignItems: 'center', gap: 14 },\n  countdownTitle: { color: Colors.textSub, fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },\n  countdownCircle: {\n    width: 90, height: 90, borderRadius: 45,\n    backgroundColor: Colors.surfaceActive,\n    borderWidth: 2, borderColor: Colors.primaryGlow,\n    alignItems: 'center', justifyContent: 'center',\n    shadowColor: Colors.primary, shadowRadius: 10, shadowOpacity: 0.1,\n  },\n  countdownNumber: { color: Colors.primaryLight, fontSize: 38, fontWeight: '900' },\n  countdownSub: { color: Colors.text, fontSize: 14, fontWeight: '600', textAlign: 'center' },\n\n  // Recording Tracking State\n  trackingContainer: { gap: 16 },\n  trackingHeader: { alignItems: 'center', marginBottom: 4 },\n  trackingTitle: { color: Colors.text, fontSize: 22, fontWeight: '800' },\n  trackingSub: { color: Colors.textSub, fontSize: 12, fontWeight: '500' },\n\n  // Idle Selection State\n  idleActiveContainer: { gap: 16 },\n  sensorLiveCard: {\n    padding: 16,\n    gap: 10,\n  },\n  sensorGroupTitle: {\n    color: Colors.textSub,\n    fontSize: 11,\n    fontWeight: '700',\n    textTransform: 'uppercase' as const,\n    letterSpacing: 0.5,\n  },\n  sensorWaiting: {\n    color: Colors.textMuted,\n    fontSize: 13,\n    fontWeight: '600',\n    textAlign: 'center' as const,\n    paddingVertical: 16,\n  },\n  exerciseSelector: { flexDirection: 'row' as const, gap: 12 },\n  exerciseCard: {\n    flex: 1,\n    borderRadius: 16,\n    padding: 20,\n    backgroundColor: Colors.surface,\n    borderWidth: 1.5,\n    borderColor: Colors.border,\n    alignItems: 'center',\n    gap: 6,\n  },\n  exerciseCardActive: {\n    backgroundColor: Colors.surfaceActive,\n    borderColor: Colors.primaryGlow,\n    shadowColor: Colors.primary,\n    shadowRadius: 12,\n    shadowOpacity: 0.08,\n  },\n  exerciseLabel: { color: Colors.text, fontSize: 15, fontWeight: '700' },\n  exerciseDesc: { color: Colors.textSub, fontSize: 11, fontWeight: '500' },\n  kiCard: {\n    padding: 20,\n    gap: 12,\n    borderWidth: 1,\n    borderColor: Colors.border,\n    borderRadius: 16,\n    marginBottom: 8,\n  },\n  kiHeader: {\n    flexDirection: 'row',\n    justifyContent: 'space-between',\n    alignItems: 'center',\n  },\n  kiTitleGroup: {\n    flex: 1,\n    gap: 4,\n  },\n  kiTitle: {\n    color: Colors.textSub,\n    fontSize: 11,\n    fontWeight: '700',\n    textTransform: 'uppercase',\n    letterSpacing: 0.5,\n  },\n  kiLabel: {\n    color: Colors.text,\n    fontSize: 16,\n    fontWeight: '800',\n  },\n  qualityBadge: {\n    paddingHorizontal: 10,\n    paddingVertical: 5,\n    borderRadius: 8,\n    alignItems: 'center',\n    justifyContent: 'center',\n  },\n  qualityText: {\n    fontSize: 12,\n    fontWeight: '700',\n    textTransform: 'uppercase',\n    letterSpacing: 0.5,\n  },\n  kiFeedbackRow: {\n    flexDirection: 'row',\n    alignItems: 'center',\n    gap: 6,\n    paddingTop: 10,\n    borderTopWidth: 1,\n    borderTopColor: 'rgba(0,255,180,0.06)',\n  },\n  kiTippLabel: {\n    color: Colors.textSub,\n    fontSize: 13,\n    fontWeight: '600',\n  },\n  kiTippText: {\n    color: Colors.text,\n    fontSize: 13,\n    fontWeight: '700',\n  },\n  kiConfidenceRow: {\n    alignItems: 'flex-end',\n  },\n  kiConfidenceText: {\n    color: Colors.textSub,\n    fontSize: 11,\n    fontWeight: '500',\n  },\n  liveQualityCard: {\n    padding: 22,\n    borderRadius: 20,\n    gap: 16,\n    borderWidth: 1.5,\n    borderColor: Colors.border,\n  },\n  liveExerciseLabel: {\n    color: Colors.text,\n    fontSize: 24,\n    fontWeight: '900',\n    letterSpacing: -0.5,\n  },\n  anomalySection: {\n    gap: 8,\n    paddingTop: 8,\n    borderTopWidth: 1,\n    borderTopColor: 'rgba(0,255,180,0.06)',\n  },\n  anomalyRow: {\n    flexDirection: 'row',\n    justifyContent: 'space-between',\n    alignItems: 'center',\n  },\n  anomalyLabelText: {\n    color: Colors.textSub,\n    fontSize: 13,\n    fontWeight: '600',\n  },\n  anomalyValueText: {\n    fontSize: 20,\n    fontWeight: '800',\n  },\n  qualityBarBg: {\n    height: 8,\n    backgroundColor: 'rgba(255,255,255,0.08)',\n    borderRadius: 4,\n    overflow: 'hidden',\n  },\n  qualityBarFill: {\n    height: '100%',\n    borderRadius: 4,\n  },\n  qualityDescription: {\n    fontSize: 12,\n    fontWeight: '700',\n    textTransform: 'uppercase',\n    letterSpacing: 0.5,\n    textAlign: 'right',\n  },\n});\n",
    "app/app/(tabs)/_layout.tsx": "/**\n * @implements FA1.1\n */\nimport React from 'react';\nimport { View } from 'react-native';\nimport { Tabs } from 'expo-router';\nimport { Colors } from '@/constants/Colors';\nimport { AuroraBackground } from '@/components/AuroraBackground';\nimport { SideNav } from '@/components/side_nav/SideNav';\n\nexport default function TabLayout() {\n  return (\n    <View style={{ flex: 1, backgroundColor: Colors.bg }}>\n      <AuroraBackground />\n      <Tabs\n        screenOptions={{\n          headerShown: false,\n          tabBarStyle: { display: 'none' },\n        }}\n      >\n        <Tabs.Screen name=\"index\" />\n        <Tabs.Screen name=\"history\" />\n        <Tabs.Screen name=\"settings\" />\n      </Tabs>\n      <SideNav />\n    </View>\n  );\n}\n",
    "embedded/src/components/led_display_controller/VisualFeedback.cpp": "// @implements FA2.4\n#include \"VisualFeedback.h\"\n#include \"../ble_streamer/BLEStreamer.h\"\n\n// RGB LED Pins des XIAO nRF52840 (LOW = An, HIGH = Aus)\n#ifndef LEDR\n#define LEDR LED_RED\n#endif\n#ifndef LEDB\n#define LEDB LED_BLUE\n#endif\n#ifndef LEDG\n#define LEDG LED_GREEN\n#endif\n\nstatic const int RED_ledPin = LEDR;\nstatic const int BLUE_ledPin = LEDB;\nstatic const int GREEN_ledPin = LEDG;\n\nstatic void cooldownDelay(unsigned long ms) {\n    unsigned long start = millis();\n    while (millis() - start < ms) {\n        pollBLE();\n        delay(10);\n    }\n}\n\n// @implements FA2.4\nvoid initFeedback() {\n    \n    // LEDs initial ausschalten\n    pinMode(RED_ledPin, OUTPUT);\n    pinMode(BLUE_ledPin, OUTPUT);\n    pinMode(GREEN_ledPin, OUTPUT);\n    digitalWrite(RED_ledPin, HIGH);\n    digitalWrite(BLUE_ledPin, HIGH);\n    digitalWrite(GREEN_ledPin, HIGH);\n}\n\nstatic unsigned long cooldownUntil = 0;\n\n// @implements FA2.4\nbool isFeedbackInCooldown() {\n    if (!isBLEConnected()) return false;\n    return millis() < cooldownUntil;\n}\n\n// @implements FA2.4\nvoid updateFeedback(const String& best_label, float best_val, float anomaly_score) {\n\n    if (!isBLEConnected()) {\n        // Solange kein Bluetooth verbunden ist: Langsames Blinken (Blau an/aus)\n        static bool blinkState = false;\n        blinkState = !blinkState;\n        digitalWrite(RED_ledPin, HIGH);\n        digitalWrite(GREEN_ledPin, HIGH);\n        digitalWrite(BLUE_ledPin, blinkState ? LOW : HIGH);\n        \n        String dispLabel = (best_label == \"LateralRaise\" || best_label == \"LateralRaises\") ? \"LateralRaise\" : \"Idle\";\n        sendJsonToPC(dispLabel, best_val, anomaly_score, \"Warte auf Bluetooth-Verbindung...\");\n        cooldownDelay(500);\n        return;\n    }\n\n    if (best_label == \"Idle\" || best_label == \"idle\" || best_val < 0.6) {\n        // Ruhemodus -> LED dauerhaft Blau\n        digitalWrite(RED_ledPin, HIGH);\n        digitalWrite(BLUE_ledPin, LOW); \n        digitalWrite(GREEN_ledPin, HIGH);\n        \n        sendJsonToPC(\"idle\", best_val, anomaly_score, \"Bereit\");\n        streamInferenceResult(\"idle\", best_val, anomaly_score, \"Bereit\");\n        cooldownUntil = millis() + 1000;\n    } \n    else if (best_label == \"ShoulderPress\" || best_label == \"shoulderpress\") {\n        // Schulterdrücken -> LED Magenta/Lila (Rot + Blau)\n        digitalWrite(RED_ledPin, LOW);\n        digitalWrite(BLUE_ledPin, LOW); \n        digitalWrite(GREEN_ledPin, HIGH);\n        \n        sendJsonToPC(\"ShoulderPress\", best_val, anomaly_score, \"Schulterdruecken erkannt\");\n        streamInferenceResult(\"ShoulderPress\", best_val, anomaly_score, \"Schulterdruecken erkannt\");\n        cooldownUntil = millis() + 1500;\n    }\n    else if (best_label == \"lateralraise\" || best_label == \"LateralRaise\" || best_label == \"LateralRaises\") {\n        // Seitheben -> LED Türkis (Blau + Grün)\n        digitalWrite(RED_ledPin, HIGH);\n        digitalWrite(BLUE_ledPin, LOW); \n        digitalWrite(GREEN_ledPin, LOW);\n        \n        sendJsonToPC(\"lateralraise\", best_val, anomaly_score, \"Seitheben erkannt\");\n        streamInferenceResult(\"lateralraise\", best_val, anomaly_score, \"Seitheben erkannt\");\n        cooldownUntil = millis() + 1500;\n    }\n    else if (best_label == \"curl\" || best_label == \"Curl\" || best_label == \"CURL\" || best_label == \"curl_sauber\") {\n        // Sauberer Curl -> LED Grün\n        digitalWrite(RED_ledPin, HIGH);\n        digitalWrite(BLUE_ledPin, HIGH);\n        digitalWrite(GREEN_ledPin, LOW);\n        \n        sendJsonToPC(\"curl\", best_val, anomaly_score, \"Super Ausfuehrung!\");\n        streamInferenceResult(\"curl\", best_val, anomaly_score, \"Super Ausfuehrung!\");\n        cooldownUntil = millis() + 1500; // Cooldown um Doppel-Erkennung des gleichen Curls zu verhindern\n    }\n    else {\n        // Fallback: Irgendein Fehler oder unbekannte Klasse -> LED Rot\n        digitalWrite(RED_ledPin, LOW);\n        digitalWrite(BLUE_ledPin, HIGH);\n        digitalWrite(GREEN_ledPin, HIGH);\n \n        sendJsonToPC(best_label, best_val, anomaly_score, \"Bewegung korrigieren\");\n        streamInferenceResult(best_label, best_val, anomaly_score, \"Bewegung korrigieren\");\n        cooldownUntil = millis() + 1500;\n    }\n}\n\n// @implements FA2.4\nvoid sendJsonToPC(String label, float confidence, float anomaly, String tipp) {\n    Serial.print(\"{\\\"event\\\": \\\"inferenz_ergebnis\\\", \");\n    Serial.print(\"\\\"klasse\\\": \\\"\" + label + \"\\\", \");\n    Serial.print(\"\\\"wahrscheinlichkeit\\\": \" + String(confidence, 3) + \", \");\n    Serial.print(\"\\\"anomalie_score\\\": \" + String(anomaly, 3) + \", \");\n    Serial.println(\"\\\"tipp\\\": \\\"\" + tipp + \"\\\"}\");\n}\n",
    "embedded/src/components/led_display_controller/VisualFeedback.h": "#ifndef VISUAL_FEEDBACK_H\n#define VISUAL_FEEDBACK_H\n\n#include <Arduino.h>\n\n// @implements FA2.4\nvoid initFeedback();\n\n// @implements FA2.4\nvoid updateFeedback(const String& best_label, float best_val, float anomaly_score);\n\n// @implements FA2.4\nbool isFeedbackInCooldown();\n\n// @implements FA2.4\nvoid sendJsonToPC(String label, float confidence, float anomaly, String tipp);\n\n#endif // VISUAL_FEEDBACK_H\n",
    "app/components/sensor_card/SensorCard.tsx": "/**\n * @implements FA1.2, FA1.3, NF3\n */\nimport React from 'react';\nimport { View, Text, StyleSheet, Switch } from 'react-native';\nimport { GlassCard } from '@/components/GlassCard';\nimport { PulseRing } from '@/components/PulseRing';\nimport { GradientButton } from '@/components/GradientButton';\nimport { Colors } from '@/constants/Colors';\nimport { ConnectionStatus, useBLEStore } from '@/store';\n\ninterface Props {\n  status: ConnectionStatus;\n  deviceName: string | null;\n  onScan: () => void;\n  onDisconnect: () => void;\n}\n\nconst STATUS_COLOR: Record<ConnectionStatus, string> = {\n  idle: Colors.textMuted,\n  scanning: Colors.warning,\n  connecting: Colors.warning,\n  connected: Colors.connected,\n  disconnected: Colors.textSub,\n  error: Colors.error,\n};\n\nconst STATUS_LABEL: Record<ConnectionStatus, string> = {\n  idle: 'Kein Sensor',\n  scanning: 'Suche läuft...',\n  connecting: 'Verbinde...',\n  connected: 'Verbunden',\n  disconnected: 'Getrennt',\n  error: 'Fehler',\n};\n\nfunction StatusLabel({ status }: { status: ConnectionStatus }) {\n  return (\n    <Text style={[styles.statusLabel, { color: STATUS_COLOR[status] }]}>\n      {STATUS_LABEL[status]}\n    </Text>\n  );\n}\n\nfunction ScanningDots({ color }: { color: string }) {\n  return (\n    <View style={styles.dots}>\n      {[0, 1, 2].map((i) => (\n        <View key={i} style={[styles.dot, { backgroundColor: color, opacity: 0.5 + i * 0.2 }]} />\n      ))}\n    </View>\n  );\n}\n\nexport function SensorCard({ status, deviceName, onScan, onDisconnect }: Props) {\n  const isConnected = status === 'connected';\n  const isActive = status === 'scanning' || status === 'connecting';\n  const color = STATUS_COLOR[status];\n  \n  const { isDemoMode, setDemoMode } = useBLEStore();\n\n  return (\n    <GlassCard active={isConnected}>\n      <View style={styles.cardContent}>\n        <View style={styles.row}>\n          <PulseRing color={color} size={9} active={isConnected} />\n\n          <View style={styles.info}>\n            <Text style={styles.deviceName}>{deviceName ?? (isDemoMode ? 'Simulierter Sensor' : 'XIAO nRF52840')}</Text>\n            <StatusLabel status={status} />\n          </View>\n\n          {isConnected && (\n            <GradientButton label=\"Trennen\" variant=\"ghost\" onPress={onDisconnect} style={styles.btn} />\n          )}\n          {!isConnected && !isActive && (\n            <GradientButton label=\"Verbinden\" variant=\"primary\" onPress={onScan} style={styles.btn} />\n          )}\n          {isActive && <ScanningDots color={color} />}\n        </View>\n\n        {!isConnected && !isActive && (\n          <View style={styles.demoToggleRow}>\n            <Text style={styles.demoLabel}>Demo-Modus (Sensor simulieren)</Text>\n            <Switch\n              value={isDemoMode}\n              onValueChange={setDemoMode}\n              trackColor={{ false: '#1C3530', true: Colors.primaryDim }}\n              thumbColor={isDemoMode ? Colors.primary : '#4D8C7C'}\n            />\n          </View>\n        )}\n      </View>\n    </GlassCard>\n  );\n}\n\nconst styles = StyleSheet.create({\n  cardContent: { gap: 10 },\n  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },\n  info: { flex: 1, gap: 3 },\n  deviceName: { color: Colors.text, fontSize: 15, fontWeight: '700', letterSpacing: -0.2 },\n  statusLabel: { fontSize: 12, fontWeight: '600' },\n  btn: { flexShrink: 0 },\n  dots: { flexDirection: 'row', gap: 4, alignItems: 'center' },\n  dot: { width: 5, height: 5, borderRadius: 2.5 },\n  demoToggleRow: {\n    flexDirection: 'row',\n    alignItems: 'center',\n    justifyContent: 'space-between',\n    paddingTop: 8,\n    borderTopWidth: 1,\n    borderTopColor: 'rgba(0,255,180,0.06)',\n  },\n  demoLabel: {\n    color: Colors.textSub,\n    fontSize: 12,\n    fontWeight: '600',\n  },\n});\n"
  }
};