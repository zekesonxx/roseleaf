# roseleaf: Node.js i18n
I know there's already i18n engines, but what about a NEW one?
Currently very disorganized and badly implemented.

## The Format:
The only reason to actually use this over a different engine currently
* Comments can be done with `#` or `//`. No block comments.
* Basic Strings: `header: Welcome to product!`
* Parameters: `welcome(name, date): Welcome #{name}, you joined on #{date}!`
* Block strings:
````text
disclaimer|
  This product is not to be used to set people on fire.
  It is only meant to be used to set cookies on fire.
````
### Planned ###
* Code strings (like date formatting): `time$ HH:MM:SS`
* Transclusion:
````text
hello: Hello there
hello_signedin: #!{hello} registered user
````



## Usage
In Beta, don't use

## License
MIT, see `LICENSE`