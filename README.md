# Λioi
Electron app supercharging [ORCΛ](https://wiki.xxiivv.com/#orca)'s UDP operator to send complex OSC message


- path:  
    `;foo` would send `/foo` to your first host  
    `;bar` would send `/bar` to your first host

- integers:  
    `;foo;5` would send `/foo 5` to your first host  
    `;foo;127` would send `/foo 127` to your first host

- strings:  
    `;foo;yes` would send `/foo "yes"` to your first host  
    `;foo;h3ll0` would send `/foo "h3ll0"` to your first host

- floats:  
    `;foo;3f` would send `/foo 0.3` to your first host  
    `;foo;235f` would send `/foo 23.5` to your first host

- base 36 integers:  
    `;foo;c` would send `/foo 12` to your first host

- multiple parameters:  
    split parameters using `;`  
    `;foo;yo;5` would send `/foo "yo" 5` to your first host

- choice of host:  
    when no index is mentionned Λioi sends the message to the first host  
    start UDP message with `base 36 indexes` followed by `#`  
    `;2#foo` would send `/foo` to the third host in Λioi  
    `;a#foo;2f` would send `/foo 0.2` to the tenth host in Λioi

- sending message to multiple hosts:  
    `;2a#foo` would send `/foo` to the third and tenth hosts in Λioi