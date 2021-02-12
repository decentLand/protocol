const arweave = Arweave.init()

let total_size = 0;
const owners = [];
let unique_users = new Map();

async function posts_count() {
    

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
                    		op: 'or',
                    		expr1: 
                    		{
                    			op: 'equals',
                    			expr1: 'Type',
                    			expr2: 'Post'

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
                    							op: 'and',
                    							expr1:
                    							{
                    								op: 'equals',
                    								expr1: 'Version',
                    								expr2: '1'
                    							},
                    							expr2:
                    							{
                    						
                    						
                    							
                    									op: 'equals',
                    									expr1: 'v-protocol',
                    									expr2: '0.0.1'
                    								},
                    								
                    							
                    							
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
    
    const posts_count = posts_list.length
    document.getElementById('posts_count').innerHTML = posts_count;

    for (tx of posts_list) {
    	tx_obj =  await arweave.transactions.get(tx)
    	tx_owner = tx_obj["owner"]
    	tx_size = tx_obj["data_size"]
    	
    	owners.push(tx_owner)
    	total_size += Number(tx_size) 
    };

    owners.forEach(owner => {
    	unique_users.has(owner) ? console.log('exist') : unique_users.set(owner, 'unique_user')
    })





document.getElementById('members').innerHTML = unique_users.size
document.getElementById('data_size').innerHTML = total_size


    
    
}

posts_count();

