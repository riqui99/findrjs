# findrjs

findrjs is a two parts module to discover devices in your network.


## How to use:

Install the service in your server -python required- (like raspberry pi). And discover your network devices using the index.html+js files running in other server or in localhost.

> If you don't want run the server you can use http://find.99porciento.es that is running this web tool online.

## Installation:

Execute the service in your server, running findr.py or install the service using ./install.sh to configure the port and autostart.
```
cd service
python findr.py
```

OR

```
cd service
./install.sh
```

After that you should discover your device from findr javascript tool.

Add the index.html and js folder on your server, or visit http://find.99porciento.es and start discovering in your network.

Have fun!