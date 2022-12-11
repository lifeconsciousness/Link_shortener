const linkShortener = function(){

    const input = document.getElementById("inputLink")
    const shortenBtn = document.querySelector(".shortenBtn")
    const message = document.querySelector(".message")
    const linkValidMessage = document.querySelector(".linkValid")
    const resultLink = document.querySelectorAll(".result-link")
    const previousLink = document.querySelectorAll(".prev-link")
    const deleteIcons = document.querySelectorAll(".trashBin")


    //checks whether link is valid and outputs the result
    input.addEventListener("input", function checkLink(){
        if(isValidUrl(input.value)){
            linkValidMessage.innerText = "Link is valid"
        } else{
            linkValidMessage.innerText = "Link is not valid"
        }
    })

    //on button click executes shortening function
    shortenBtn.addEventListener("click", function(){
        shortenLink()
        //shortenLinkAsync()
        message.innerText = "Click on the link to copy it "
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
                .then(res => res.json())                                        //first convert the data from json string to js object
                .then(data => createLink(data.result.full_short_link, link))          //then pass the received data to the function 
                .catch(error => console.log(error))                             //catch any errors
        } else{
            return
        }
    }

    //alternative method of handling promises
    async function shortenLinkAsync(){
        let link = input.value

        if(isValidUrl(link)){
            //we can't catch an error without try/catch in async function
            try {
                let response = await fetch(`https://api.shrtco.de/v2/shorten?url=${link}`)
                if(response.ok){
                    const data = await response.json()
                    createLink(data.result.full_short_link)
                }    
            } catch (error){
                console.log("Error:" + error)
            }
        } 
        else{
            return
        }
    }





    const INDEX_LOCAL_STORAGE_KEY = 'indexKey'
    const HISTORY_OBJECT_LOCAL_STORAGE_KEY = 'historyObjectKey'

    let historyElementIndex = JSON.parse(localStorage.getItem(INDEX_LOCAL_STORAGE_KEY)) || 0
    let historyElementsArray = JSON.parse(localStorage.getItem(HISTORY_OBJECT_LOCAL_STORAGE_KEY)) || []

    function createLink(shortenedLink, firstLink){
        resultLink[0].innerText = shortenedLink
        previousLink[0].innerText = firstLink

        let historyObject =  createLinkHistoryObject(shortenedLink, firstLink)
        historyElementsArray.push(historyObject)

        historyElementIndex++
        console.log(historyElementsArray)
        save()
        render()
    }

    function createLinkHistoryObject(shortenedLink, firstLink){
        return {
            id: historyElementIndex,
            shortLink: shortenedLink,
            longLink: firstLink
        }
    }



    function save(){
        localStorage.setItem(INDEX_LOCAL_STORAGE_KEY, historyElementIndex)
        localStorage.setItem(HISTORY_OBJECT_LOCAL_STORAGE_KEY, JSON.stringify(historyElementsArray))
    }
    function render(){
        
    }



    deleteIcons.forEach(icon => addEventListener("click", deleteElement))

    deleteIcons[1].dataset.index = 3

    function deleteElement(event){
        //console.log("delete " + event.target.dataset.index)
    }






    //press on a link to copy it to the clipboard
    previousLink.forEach(element => addEventListener('click', copyText))
    resultLink.forEach(element => addEventListener('click', copyText))

    async function copyText(event){
        if(event.target.classList.contains('result-link') || event.target.classList.contains('prev-link')){
            
            if (!navigator.clipboard) {
                // Clipboard API is not available
                return
            }
            const textToCopy = event.target.innerText
            try {
                await navigator.clipboard.writeText(textToCopy)
                message.innerText = "Copied to clipboard"
                returnPreviousMesage()
            } catch (err) {
                console.error('Failed to copy!', err)
            }
        }
    }

    //check whether entered url is valid
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

    //after some time change message back to it's normal value
    function returnPreviousMesage() {
        timeout = setTimeout(changeMessage, 700);
    }
    function changeMessage() {
        message.innerText = "Click on the link to copy it "
    }

}
linkShortener()



