const arweave = Arweave.init()
const posts = [];

async function display_posts() {
    

    let get_ps_posts =
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
                    		op: 'equals',
                    		expr1: 'Content-Type',
                    		expr2: 'application/json'
                    	},

                    	expr2:
                    	{
                    		op: 'and',
                    		expr1: 
                    		{
                    			op: 'equals',
                    			expr1: 'action',
                    			expr2: 'post'

                    		},
                    		expr2:
                    		{
                    			op: 'and',
                    			expr1:
                    			{
                    				op: 'equals',
                    				expr1: 'version',
                    				expr2: '0.0.2'
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
                    					expr1: 'tribus-id',
                    					expr2: "null"
                    				}
                    			}

                    		}
                    		
                    	}
                    }
            }
                

    const res = await arweave.api.post('arql', get_ps_posts)
    const posts_list = res["data"]

    for (post of posts_list) {
    	const post_data = JSON.parse( await arweave.transactions.getData(post, {decode: true, string: true}) );
    	const username = post_data["username"];
    	const user_id = post_data["userId"];
    	const post_id = post_data["post_id"];
    	const post_text = await arweave.transactions.getData(post_id, {decode: true, string: true})

    	const decentland_post = {
    		username,
    		user_id,
    		post_id,
    		post_text
    	};

    	posts.push(decentland_post)

    };

    Vue.component('tweet-component', {
  template: `<li>
        <div class="avatar">
          <img src="https://arweave.net/YIIOVeXyzHu-PKE-9L8fxCWTrLEm32wEn62t_BE7cvs">
        </div>
        <div class="bubble-container">
          <div class="bubble"> 
          <h3 >@{{tweet.username}}</h3><br/>
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

display_posts()

