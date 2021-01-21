async function getWalletUniqueness() {

    const arweave = Arweave.init()

    // `pub_key` is retrieved from the context
    
    let get_applicant_wallet =
            {
                op: 'and',
                expr1:
                    {
                        op: 'equals',
                        expr1: 'user-id',
                        expr2: pub_key,
                    },
                
                expr2:
                    {
                      op: 'and',
                        expr1: 
                                {
                                    op: 'equals',
                                    expr1: 'App-Name',
                                    expr2: 'w3gram'
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
                                                            expr2: pub_key,
                                                        },
                                                },
                                    },

                            },
                    },

            }
                    
     
     const res = await arweave.api.post('arql', get_applicant_wallet)
     
     if(res["data"].length > 0) {
        
        alert("wallet already in use");
        return;
     } 


};

export getWalletUniqueness
