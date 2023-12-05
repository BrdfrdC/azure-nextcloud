# NextAzure Installation Manual

## NOTES

NextAzure currently works only for Microsoft users that are not affiliated with an organization and that are invited by NextAzure admins. 

The installation instructions are for the Windows operating system and much of the instructions are taken from the development environment installation tutorial provided by NextCloud, which can be found here. If you would like, you may follow the instructions on the NextCloud website before returning to Step 8 in this manual to complete the installation of NextAzure.


## Step 1: Prerequisites

To begin installing the NextCloud development environment, you will need:
•	A recent Windows build of version 20262 or newer
•	Windows 11 64-bit Home or Pro version 21H2 or higher, or Enterprise or Education version 21H2 or higher OR Windows 10 64-bit Home or Pro 21H1 (build 19043) or higher, or Enterprise or Education 20H2 (build 19042) or higher.
•	8GB system RAM or more
•	SSD system-storage with at least 40GB free space
•	4-core
•	8-threads CPU
•	Administrator access to the computer you will be using
•	An internet browser. Firefox is heavily recommended for NextAzure


## Step 2: Installing WSL 2

1.	Open the Windows Command Prompt in administrator mode by right-clicking and selecting 'Run as Administrator.’
2.	Enter the following command: wsl --install -d Ubuntu-20.04
3.	Follow the installation procedure. 
a.	If you get the error WSL 2 requires an update to its kernel component. For information, please visit https://aka.ms/wsl2kernel , visit the link, download the kernel, and install the kernel.


## Step 3: Setting up Ubuntu

1.	Open 'Ubuntu' through the windows start menu
2.	You will be asked to create a User Name and Password for your Linux distribution. 
a.	This User Name and Password is specific to each separate Linux distribution that you install and has no bearing on your Windows user name.
b.	Please note that whilst entering the Password, nothing will appear on screen. This is called blind typing. You won't see what you are typing, this is completely normal.


## Step 4: Setting Up Docker

1.	Go to https://www.docker.com/products/docker-desktop/ Click on the download link for Windows users. This will download a .exe file.
2.	When the download is finished, open the .exe file. Follow the installation procedure.
3.	When the installation procedure is finished, you might get a prompt to restart your computer. If you get this prompt, restart your computer.
4.	Once installed, start Docker Desktop from the Windows Start menu, then select the Docker icon from the hidden icons menu of your taskbar. Right-click the icon to display the Docker commands menu and select "Settings".
5.	Read and accept the terms of service when prompted.
6.	Ensure that "Use the WSL 2 based engine" is checked in Settings > General
7.	Ensure that the Ubuntu distributions are selected in Settings > Resources > WSL Integration.
8.	To confirm that Docker has been installed, open a WSL distribution (e.g. Ubuntu) and display the version and build number by entering: docker --version
9.	Inside ubuntu some docker commands can only be run by members of the docker group. Add your user to the group so you can run docker commands easily (Replace user_name with your login): sudo usermod -aG docker user_name
10.	Confirm that the following command works: docker ps
a.	The output should be: CONTAINER ID IMAGE COMMAND CREATED STATUS PORT NAMES
b.	If the command docker ps does not work, you might be able to fix this by toggling the WSL integration in docker desktop off and on.


## Step 5: Installing nvm and node in Ubuntu

1.	Open Ubuntu and make sure it is up to date by running: sudo apt update && sudo apt upgrade
2.	Install curl by running: sudo apt install curl
3.	Install nvm by running: curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/master/install.sh | bash
4.	Check if nvm is working and see which versions of node are installed by running: nvm ls
a.	There should be no versions of node
5.	Install node 16 by running: nvm install 16
6.	Check if node and npm are installed:
a.	node --version
b.	npm –version


## Step 6: Editing your host file

1.	Run a text editor program such as Notepad as an administrator
2.	In Notepad, click File> Open
3.	Navigate to C:\Windows\System32\drivers\etc
4.	In the lower-right corner, just above the Open button, click the drop-down menu to change the file type to All Files.
5.	Select “hosts” and click Open.
6.	Add the following entry to the bottom of the host file and save the file: 
a.	127.0.0.1 nextcloud.local


## Step 7: Install git and nextcloud-docker-dev

1.	Install the git version control system by running: sudo apt install git
2.	Clone the nextcloud-docker-dev development environment for Nextcloud and follow the simple master setup to download and install Nextcloud by running the following commands:
a.	git clone https://github.com/juliushaertl/nextcloud-docker-dev.git
b.	cd nextcloud-docker-dev
c.	./bootstrap.sh
d.	sudo sh -c "echo '127.0.0.1 nextcloud.local' >> /etc/hosts"


## Step 8: Installing NextAzure

1.	Navigate to NextCloud’s apps folder by running: cd workspace/server/apps
2.	Clone the NextAzure repository by running: git clone https://github.com/BrdfrdC/azure-nextcloud
3.	Ensure that you have the require npm packages by running the following commands:
a.	npm i webpack
b.	npm i jwt-decode
4.	Run the following command to ensure the compiled source script is up to date: 
a.	npm run dev


## Step 9: Updating Certificates

1.	Navigate back to the NextCloud root folder by running: cd ~/nextcloud-docker-dev
2.	Update NextCloud’s certificates by running the following commands: 
a.	sudo apt install libnss3-tools
b.	./scripts/update-certs


## Step 10: Running NextAzure

1.	Start NextCloud by running: docker-compose up nextcloud-proxy
2.	Open your browser of choice and navigate to https://nextcloud.local
a.	If prompted to sign in: use “admin” as the username and password
3.	Click on the profile avatar on the top right and navigate to Apps
4.	Find “Azure” within the list of apps and enable it
