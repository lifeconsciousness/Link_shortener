const linkShortener = function(){

    const input = document.getElementById("inputLink")
    const linkContainer = document.getElementById("link-container")
    const message = document.querySelector(".message")


    input.addEventListener("input", function(){
        shortenLink()
        message.innerText = "Click on the link to copy it "
    })

    linkContainer.addEventListener('click', async (event) => {
        if (!navigator.clipboard) {
          // Clipboard API not available
          return
        }
        const text = event.target.innerText
        try {
          await navigator.clipboard.writeText(text)
          message.innerText = "Copied to clipboard"
        } catch (err) {
          console.error('Failed to copy!', err)
        }
    })




    
    
    function shortenLink(){
        let link = input.value
    
        if(isValidUrl(link)){
            fetch(`https://api.shrtco.de/v2/shorten?url=${link}`, {
                /* to send data back to API: method specification, 
                content type and body with json object are needed.
                In this case we don't need to send anything to API
                
                method: 'POST',
                headers: {
                    'Content-Type' : 'application/json'
                },
                body: JSON.stringify({
                    key: 'value',
                    etc: 'etc'
                }) */
            })
                .then(res => res.json())                                   //first convert the data from json string to js object
                .then(data => displayLink(data.result.full_short_link))    //then pass the received data to the function 
                .catch(error => console.log(error))                        //catch any errors
        } else{
            linkContainer.innerText = "That is not a link"
        }
    }
    
    function displayLink(shortenedLink){
        linkContainer.innerText = shortenedLink
    }

    const isValidUrl = function(urlString){
		let url;
        // if urlString argument is not a valid URL, code with throw an error that will be catched and return false
		try { 
	      	url = new URL(urlString);   
	    }
	    catch(error){ 
	      return false; 
	    }
        // if the protocol is http/https it will return true
	    return url.protocol === "http:" || url.protocol === "https:"; 
	}

    shortenLink()
}
linkShortener()



