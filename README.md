mapshup-take5
=============

User friendly web client to access SPOT4 (Take5) data (http://www.cesbio.ups-tlse.fr/multitemp/?page_id=406#English) 

Installation
============

This document suppose that Take5 application will be installed in $TARGET directory

Apache configuration (Linux ubuntu)
--------------------------------------

1. Add the following rule to /etc/apache2/sites-available/default file

        Alias /mapshupTake5/ "/$TARGET/"
        <Directory "/$TARGET/">
            Options -Indexes -FollowSymLinks
            AllowOverride None
            Order allow,deny
            Allow from all
        </Directory>

Note: $TARGET should be replaced by the $TARGET value (i.e. if $TARGET=/var/www/take5, then put /var/www/take5 in the apache configuration file)

2. Relaunch Apache

        sudo apachectl restart

Build take5
-----------

Usage ./build.sh -t <target directory> [-s <source directory> -p <project name> -a -c]

 -a : performs steps 1. mapshup git clone, 2. mapshup compile and 3. build
 -c : perform steps 1. mapshup compile and 2.build
 (By default, only build step is performed)








