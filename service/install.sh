#!/bin/bash

if [ $(dpkg-query -W -f='${Status}' "dialog" 2>/dev/null | grep -c "ok installed") -eq 0 ]; then
  sudo apt-get install -y dialog
fi

# Terminal style popup
color_red="tput setaf 1"
color_green="tput setaf 2"
color_reset="tput sgr0"
backtitle="Findr"

# Default Values
installpath=$(pwd)
serverport=8878
autostart=yes

#Allow for a quiet install
if [ $# -eq 0 ] || [ "$1" != "q" ]; then
   exec 3>&1
   dialog                                         \
   --separate-widget $'\n'                        \
   --title "Findr Configuration Options"          \
   --backtitle "$backtitle"					      \
   --form ""                                      \
   0 0 0                                          \
   "Instalation Path:"        1 1   "$installpath"   1 24 54 128  \
   "Service Port:"            2 1   "$serverport"    2 24 54 4     \
   "Auto Start: (yes/no)"     3 1   "$autostart"     3 24 54 3     \
   2>&1 1>&3 | {
      read -r installpath
      read -r serverport
      # Save Temp Config File
      sudo echo "# Findr Config" > ./config.txt
      sudo echo "installpath=\"$installpath\"" >> ./config.txt
      sudo echo "serverport=\"$serverport\"" >> ./config.txt
      sudo echo "autostart=\"$autostart\"" >> ./config.txt
      sudo echo "" >> ./config.txt
   }
   exec 3>&-

   source ./config.txt
fi

fn_autostart ()
{
    tmpfile=$(mktemp)
    sudo sed '/#START/,/#END/d' /etc/rc.local > "$tmpfile" && sudo mv "$tmpfile" /etc/rc.local
    # Remove to growing plank lines.
    sudo awk '!NF {if (++n <= 1) print; next}; {n=0;print}' /etc/rc.local > "$tmpfile" && sudo mv "$tmpfile" /etc/rc.local
    if [ "$autostart" == "yes" ]; then
        if ! grep -Fq '#START FINDR SECTION' /etc/rc.local; then
            sudo sed -i '/exit 0/d' /etc/rc.local
            sudo bash -c "cat >> /etc/rc.local" << EOF
#START FINDR SECTION
sleep 4;su -c 'python $installpath/findr.py -p $serverport > /dev/null 2>&1 &' root
#END FINDR SECTION
exit 0
EOF
        else
          tmpfile=$(mktemp)
          sudo sed '/#START/,/#END/d' /etc/rc.local > "$tmpfile" && sudo mv "$tmpfile" /etc/rc.local
          # Remove to growing plank lines.
          sudo awk '!NF {if (++n <= 1) print; next}; {n=0;print}' /etc/rc.local > "$tmpfile" && sudo mv "$tmpfile" /etc/rc.local
       fi

    fi
    sudo chown root:root /etc/rc.local
    sudo chmod 755 /etc/rc.local
}

# Main install)

sudo killall findr 2>/dev/null
sudo cp ./findr.py $installpath/findr.py >/dev/null 2>&1
fn_autostart

rm ./config.txt >/dev/null 2>&1

if [ $# -eq 0 ] || [ "$1" != "q" ]; then
   echo ""
   echo ""
   echo "########################################################################"
   echo "##               Findr Service Installed Successfully!                ##"
   echo "########################################################################"
fi
