# ORCΛ x Λioi x TidalCycles

![](aioi_tidal.gif)

## Config

**ORCΛ**:  
Make sure that ORCΛ is running UDP on port 49161 (Default)
![](orca_udp_config.png)

```orca
.D.........R8
..;ctrl;a1;1.
```

**Λioi**:  
Set first host to `127.0.0.1:6010` where TidalCycles controls listening.
![](aioi_config.png)

**TidalCycles**:

```haskell
d1 $ sound "arpy*4" |+ n (cF 0 "a1")
```

First argument of `cF` function is default value.

Second argument is name for to access the value whitch we set at Orca's OSC message.

see [reference](http://)
