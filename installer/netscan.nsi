!include "MUI.nsh"

Name "Netscan"
InstallDir "$PROGRAMFILES\Netscan" # Defualt path to install the app
OutFile "ScanSetup.exe"

!insertmacro MUI_PAGE_WELCOME # Welcome page UI
!insertmacro MUI_PAGE_LICENSE "license.txt" # License page UI (Pulling the license text from "license.txt" file)
!insertmacro MUI_PAGE_DIRECTORY # List the directory being installed
!insertmacro MUI_PAGE_INSTFILES # Installation Progress bar
!insertmacro MUI_PAGE_FINISH # Installation Finish page

!insertmacro MUI_LANGUAGE "English" # Set default language

# Script to scan Network

Section "Install" section_index_output
    SetOutPath $INSTDIR
    #Check if Nmap is already installed
    IfFileExists "$PROGRAMFILES\Nmap\nmap.exe" 0 +2
        Goto SkipNmap
    
    #Download and install Nmap

    nsExec::ExecToLog 'cmd /C curl -L -o "$TEMP\nmap_installer.exe" "https://nmap.org/dist/nmap-7.94-setup.exe"' #Download nmap

    IfFileExists "$TEMP\nmap_installer.exe" +3
        MessageBox MB_ICONSTOP "Failed to download download dependencies (file not found)."
        Quit
    #Execute if Nmap does not exist
    nsExec::ExecToLog '"$TEMP\nmap_installer.exe"'
    SkipNmap:

    #Check if Python is installed

    ClearErrors
    nsExec::ExecToLog '"cmd.exe" /C python --version'

    IfErrors InstallPython #Install if not found

    StrCpy $2 $1 7 7  ; Extract "3.12.3" from "Python 3.12.3"
    StrCmp $2 "3.12.3" 0 InstallPython #Ensure Python 3 is installed
    Goto Skippython

    InstallPython:
        nsExec::ExecToLog 'cmd /C curl -L -o "$TEMP\python_installer.exe" "https://www.python.org/ftp/python/3.12.3/python-3.12.3-amd64.exe"' #Downloading python from the official site
        IfFileExists "$TEMP\python_installer.exe" +3
            MessageBox MB_ICONSTOP "Failed to download dependencies (file not found)."
            Quit
        nsExec::ExecToLog '"$TEMP\python_installer.exe" /quiet InstallAllUsers=1 PrependPath=1 Include_test=0'
    Skippython:

    #Cleaning up installers

    Delete "$TEMP\npcap_installer.exe"
    Delete "$TEMP\nmap_installer.exe"
    Delete "$TEMP\python_installer.exe"

    #Final Message
    MessageBox MB_OK "Installation complete!"

SectionEnd