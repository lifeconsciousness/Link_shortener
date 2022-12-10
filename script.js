const linkShortener = function(){

    const input = document.getElementById("inputLink")
    const linkContainer = document.querySelector(".link-container")
    
    input.addEventListener("input", function(){
        shortenLink()
    })
    
    
    function shortenLink(){
        let link = input.value
    
        if(isValidUrl(link)){
            fetch(`https://api.shrtco.de/v2/shorten?url=${link}`, {
            })
                .then(res => res.json())
                .then(data => displayLink(data.result.full_short_link))
        } else{
            linkContainer.innerText = "that is not a link"
        }
    }
    
    function displayLink(shortenedLink){
        linkContainer.innerText = shortenedLink
    }

    const isValidUrl = function(urlString){
		let url;
		try { 
	      	url =new URL(urlString); 
	    }
	    catch(e){ 
	      return false; 
	    }
	    return url.protocol === "http:" || url.protocol === "https:";
	}

}
linkShortener()



// let p = new Promise((resolve, reject) => {

// })