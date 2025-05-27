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
    
    nsExec::ExecToLog 'cmd /C python3.12 -m pip install python-nmap' #Installing pip python-nmap wrapper
    nsExec::ExecToLog 'cmd /C python3.12 -m pip install pysnmp' #Installing pip python-nmap wrapper
    nsExec::ExecToLog 'cmd /C python3.12 -m pip install sockets' #Installing pip python-nmap wrapper
    nsExec::ExecToLog 'cmd /C python3.12 -m pip install scheduler' #Installing pip python-nmap wrapper
    nsExec::ExecToLog 'cmd /C python3.12 -m pip install flask' #Installing python flask wrapper

    #Download the scanner code to the Install Directory
    nsExec::ExecToLog 'cmd /C curl -L -o "$INSTDIR\scanner.exe" "<____GITHUB_URL___>"'
    
    #prompt for a key
    MessageBox MB_OK "Enter your key prompted in the Network Account"

    InputBox "Unique Key" "Enter the key:" "" /NOUNLOAD $R0
    StrCmp $R0 "" 0 ${OrIf} StrLen $R0 != "2" 0 +3
        MessageBox MB_OK "Please enter the valid key!"
    FileOpen $0 "$INSTDIR\unique_key.conf" "w"
    FileWrite $0 $R0
    FileClose $0

    #Cleaning up installers
    Delete "$TEMP\python_installer.exe"

    #Final Message
    MessageBox MB_OK "Installation complete!"

SectionEnd