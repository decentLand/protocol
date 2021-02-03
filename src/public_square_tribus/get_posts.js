const arweave = Arweave.init()
// array of posts objects
const posts = [];

async function get_profile(address) {

    


    let get_applicant_wallet =
            {
                op: 'and',
                expr1:
                    {
                        op: 'equals',
                        expr1: 'user-id',
                        expr2: address,
                    },
                
                expr2:
                    {
                      op: 'and',
                        expr1: 
                                {
                                    op: 'equals',
                                    expr1: 'App-Name',
                                    expr2: 'decent.land'
                                },

   
                        expr2:
                            {
                            op: 'and',
                              expr1:
                                
                                    {
                                        op:'equals',
                                        expr1: 'version',
                                        expr2: '0.0.1',
                                    },
                                
                                expr2:
                                    
                                    {
                                        op: 'and',
                                            expr1:

                                            {
                                                op:'equals',
                                                expr1: 'action',
                                                expr2: 'signup'
                                            },

                                            expr2:
                                                
                                                {
                                                    op: 'and',
                                                        expr1:

                                                        {
                                                            op: 'equals',
                                                            expr1: 'Content-Type',
                                                            expr2: 'application/json',
                                                        },

                                                        expr2:
                                                        
                                                        {
                                                            op: 'equals',
                                                            expr1: 'from',
                                                            expr2: address,
                                                        },
                                                },
                                    },

                            },
                    },

            }
                    
     
     const res = await arweave.api.post('arql', get_applicant_wallet)
     
     if (res["data"].length > 0 ) {

     // last_registration_tx as signup data to be applicable later on account metada update.
     const last_registration_tx =  (res["data"][0])

     const tx_data = await arweave.transactions.getData(last_registration_tx, {decode: true, string: true});
     const usr_obj = JSON.parse(tx_data)

     const username = usr_obj["username"];
     const pfp = usr_obj["pfp"];
     const bio = usr_obj["bio"];
  
     return {
     	username,
     	pfp,
     	bio
     };


     } else if (res["data"].length === 0) {

        const username = `guest_${address.slice(0, 7)}`;
        // standard pfp for all guests
        const pfp = "78WdrVhNZ2i_KbimqcV4j-drX04HJr3E6UyD7xWc84Q";
        const bio = "a random arweaver"
     
        return {
        	username,
        	pfp,
        	bio
        };

   

     }
     
};



async function display_posts() {
    

    let get_ps_posts =
            {
                op: 'and',
                expr1:
                    {
                      op: 'equals',
                      expr1: 'App-Name',
                      expr2: 'PublicSquare'
                    },

                    expr2:
                    {
                    	op: 'and',
                    	expr1:
                    	{
                    		op: 'equals',
                    		expr1: 'Content-Type',
                    		expr2: 'text/plain'
                    	},

                    	expr2:
                    	{
                    		op: 'and',
                    		expr1: 
                    		{
                    			op: 'equals',
                    			expr1: 'Type',
                    			expr2: 'post'

                    		},
                    		expr2:
                    		{
                    			op: 'and',
                    			expr1:
                    			{
                    				op: 'equals',
                    				expr1: 'Version',
                    				expr2: '1'
                    			},

                    			expr2:
                    			{
                    				op: 'and',
                    				expr1:
                    				{
                    					op: 'equals',
                    					expr1: 'protocol',
                    					expr2: 'decent.land',
                    				},

                    				expr2:
                    				{
                    					op: 'and',
                    					expr1:
                    					{
                    						op: 'equals',
                    						expr1: 'tribus-id',
                    						expr2: "null"
                    					},

                    					expr2:
                    					{
                    						op: 'and',
                    						expr1:
                    						{
                    							op: 'equals',
                    							expr1: 'tribus-name',
                    							expr2: 'public-square',
                    						},
                    						expr2:
                    						{
                    							op: 'equals',
                    							expr1: 'v-protocol',
                    							expr2: '0.0.1'
                    						}
                    					}
                    				}
                    				
                    			}

                    		}
                    		
                    	}
                    }
            };



                

    const res = await arweave.api.post('arql', get_ps_posts)
    const posts_list = res["data"]
    console.log(posts_list)




    for (post of posts_list) {
    	// 
    	const post_obj = {};

    	let  status = await arweave.transactions.getStatus(post)
    	status = status["status"]

    	
    	// load confirmed transactions only
    	if (status != 200) {post = undefined};
    

    	if (post != undefined) {

    	const tx  = await arweave.transactions.get(post)
    	const tags = await tx.get('tags')
    	const post_text = ( await arweave.transactions.getData(post, {decode: true, string: true}) );
    	
    	post_obj["post_text"] = post_text;
    	post_obj["post_id"] = post;


    	for (tag of tags) {
		
		const key = tag.get('name', {decode: true, string: true});
		const value = tag.get('value', {decode: true, string: true});
		Object.defineProperty(post_obj, key, {value: value})

      	}

      	// last_* are profile's metadata: retrieved from the last signup tx
      	const last_profile_data = await get_profile(post_obj["user-id"])
      	const last_username = last_profile_data["username"]
      	const last_pfp_url = `https://arweave.net/${last_profile_data["pfp"]}`
 		
 		post_obj["last_username"] = last_username;
 		post_obj["last_pfp_url"] = last_pfp_url;
 		
      	

 

    	posts.push(post_obj)
    	
    	}

    };

    
    

    Vue.component('tweet-component', {
  template: `<li>
        <div class="avatar">
          <img :src = "tweet.last_pfp_url">
        </div>
        <div class="bubble-container">
          <div class="bubble"> 
          <h3 >@{{tweet.last_username}}</h3><br/>
          {{tweet.post_text}}
          <br><br><i><b>post id: {{tweet.post_id}}</b></i>
          </div>
          <div class="arrow"></div>
        </div>
      </li>
  `,
  
  props: {
    tweet: Object
  }
});

new Vue({
  el: '#app',
  data: {
    posts
  }
});
    
}

display_posts();

