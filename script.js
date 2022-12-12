const linkShortener = function(){

    //DOM elements declarations 
    const input = document.getElementById("inputLink")
    const shortenBtn = document.querySelector(".shortenBtn")
    const message = document.querySelector(".message")
    const linkValidMessage = document.querySelector(".linkValid")
    const linksContainer = document.querySelector(".all-links-container")
    let buttonCanCopy = false


    //checks whether a link is valid and outputs the result
    input.addEventListener("input", function checkLink(){
        buttonCanCopy = false
        checkButtonState()
        if(isValidUrl(input.value)){
            linkValidMessage.innerText = "Link is valid"
        } else{
            linkValidMessage.innerText = "Link is not valid"
        }
    })

    //on button click executes shortening function
    shortenBtn.addEventListener("click", function(){
        if(checkButtonState()){
            message.innerText = "You already shortened that link"
            copyLinkToClipboard()
            returnPreviousMesage()
            return
        } else{
            shortenLink()
        }
        //shortenLinkAsync()
        message.innerText = "Click on the link to copy it "
    })

    async function copyLinkToClipboard(){
        const textToCopy = historyElementsArray[historyElementsArray.length-1].shortLink
            try {
                await navigator.clipboard.writeText(textToCopy)
                message.innerText = "Copied to clipboard"
                returnPreviousMesage()
            } catch (err) {
                console.error('Failed to copy!', err)
            }
    }

    
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

        let historyObject =  createLinkHistoryObject(shortenedLink, firstLink)
        historyElementsArray.push(historyObject)

        historyElementIndex++
        buttonCanCopy = true
        checkButtonState()
        saveAndRender()
    }

    function createLinkHistoryObject(shortenedLink, firstLink){
        return {
            id: historyElementIndex,
            shortLink: shortenedLink,
            longLink: firstLink
        }
    }

    function saveAndRender(){
        save()
        render()
    }

    function save(){
        localStorage.setItem(INDEX_LOCAL_STORAGE_KEY, historyElementIndex)
        localStorage.setItem(HISTORY_OBJECT_LOCAL_STORAGE_KEY, JSON.stringify(historyElementsArray))
    }
    function render(){
        clearElement(linksContainer)
        for(let i = historyElementsArray.length-1; i >= 0; i--){
            

            let container = document.createElement("div")
            container.classList.add("prev-link-and-result")
            linksContainer.appendChild(container)

            let bothLinks = document.createElement("div")
            bothLinks.classList.add("bothLinks")
            container.appendChild(bothLinks)

            let prevLink = document.createElement("div")
            prevLink.classList.add("prev-link")
            prevLink.innerText = historyElementsArray[i].longLink
            prevLink.addEventListener('click', copyText)
            bothLinks.appendChild(prevLink)

            let resLink = document.createElement("div")
            resLink.classList.add("result-link")
            resLink.innerText = historyElementsArray[i].shortLink
            resLink.addEventListener('click', copyText)
            bothLinks.appendChild(resLink)

            let deleteIcon = document.createElement("img")
            deleteIcon.classList.add("trashBin")
            deleteIcon.src = "/img/trash.png"
            deleteIcon.dataset.index = historyElementsArray[i].id
            deleteIcon.addEventListener("click", deleteElement)
            container.appendChild(deleteIcon)
        }  
    }

    function clearElement(element){
        while(element.firstChild){
            element.removeChild(element.firstChild)
        }
    }




    function deleteElement(event){
        if(event.target.classList.contains("trashBin")){
            let elementToDelete = event.target.dataset.index

            historyElementsArray = historyElementsArray.filter(element => element.id != elementToDelete)
            message.innerHTML = "Element deleted"
            returnPreviousMesage()
            saveAndRender()
        }
    }







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

    function checkButtonState(){
        if(buttonCanCopy){
            shortenBtn.innerText = "Copy"
            return true
        } else{
            shortenBtn.innerText = "Shorten"
            return false
        }
    }

    render()
}
linkShortener()



