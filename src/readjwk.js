function readJwk(input) {
  let file = input.files[0];

  let reader = new FileReader();

  reader.readAsText(file);

  reader.onload = async function() {
    console.log(await pkToPub(reader.result))
    document.getElementById("test").innerText = 
    `user-id: ${await pkToPub(reader.result)}`
    
     }
  reader.onerror = function() {
    alert(reader.error);
    return
  };

}

export readjwk