#Web Socket Reference

## Subscribe to WebSocket
`{"event":"subscribe","data":["xrb_1ipx847tk8o46pwxt5qjdbncjqcbwcc1rrmqnkztrfjy5k7z4imsrata9est"]}`

## Get Pending Blocks for Accounts
Send message to WebSocket:
`{"event":"pending","data":["xrb_1ipx847tk8o46pwxt5qjdbncjqcbwcc1rrmqnkztrfjy5k7z4imsrata9est"]}`

## Data Format

```{
   "status":"success",
   "res":{
      "xrb_1zcwez9jgisedk6hnwwt9m6az4cfnhqehgdqo149i4dqsdjozbfasnqb856h":{
         "account":"xrb_1zcwez9jgisedk6hnwwt9m6az4cfnhqehgdqo149i4dqsdjozbfasnqb856h",
         "blocks":[
            {
               "amount":"100000000000000000000000000000",
               "from":"xrb_1zcwez9jgisedk6hnwwt9m6az4cfnhqehgdqo149i4dqsdjozbfasnqb856h",
               "hash":"8367933EED64DABF095665132DE9314A03E57CF36F0664FE6E71D566D334AF04"
            },
            {
               "amount":"100000000000000000000000000000",
               "from":"xrb_1zcwez9jgisedk6hnwwt9m6az4cfnhqehgdqo149i4dqsdjozbfasnqb856h",
               "hash":"CC757A59A32319BF15403B5823A61EC2ACB27866D68807F6338261E1E3810C29"
            }
         ]
      }
   }
}```