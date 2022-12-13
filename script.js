const linkShortener = function(){

    //DOM elements declarations 
    const input = document.getElementById("inputLink")
    const shortenBtn = document.querySelector(".shortenBtn")
    const message = document.querySelector(".message")
    const linkValidMessage = document.querySelector(".linkValid")
    const linksContainer = document.querySelector(".all-links-container")
    let buttonCanCopy = false
    let playAnimationAfterShortening = false


    //checks whether a link is valid and outputs the result
    input.addEventListener("input", function checkLink(){
        buttonCanCopy = false
        checkButtonState()
        if(isValidUrl(input.value)){
            linkValidMessage.innerText = "Link is valid"
        } 
        else if(input.value == ""){
            linkValidMessage.innerText = "Field is empty"
        } 
        else{
            linkValidMessage.innerText = "Link is not valid"
        }
    })

    //on button click executes shortening function
    shortenBtn.addEventListener("click", function(){
        if(input.value == ""){
            linkValidMessage.innerText = "Field is empty"
        } 
        if(input.value.includes("shrtco.de")){
            linkValidMessage.innerText = "You can't make this link shorter"
        } 
        if(checkButtonState()){

            copyLinkToClipboard()
            returnPreviousMesage()
            return
        } else{
            shortenLink()           //both functions can be used
            //shortenLinkAsync()
        }
        message.innerText = "Click on the link to copy it "
    })

    //copied link that is currently in input field. uses after pressing "copy" button
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

    //sends link to API and passes the received data to the createRecord function
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
                .then(data => createRecord(data.result.full_short_link, link))          //then pass the received data to the function 
                .catch(error => console.log(error))                             //catch any errors
        } else{
            return
        }
    }

    //alternative method of handling promises/api fetch
    async function shortenLinkAsync(){
        let link = input.value

        if(isValidUrl(link)){
            //we can't catch an error without try/catch in async function
            try {
                let response = await fetch(`https://api.shrtco.de/v2/shorten?url=${link}`)
                if(response.ok){
                    const data = await response.json()
                    createRecord(data.result.full_short_link, link)
                }    
            } catch (error){
                console.log("Error:" + error)
            }
        } 
        else{
            return
        }
    }


    //keys for the local storage
    const INDEX_LOCAL_STORAGE_KEY = 'indexKey'
    const HISTORY_OBJECT_LOCAL_STORAGE_KEY = 'historyObjectKey'

    //onload it either gets value from storage or assigns 0/empty array
    let historyElementIndex = JSON.parse(localStorage.getItem(INDEX_LOCAL_STORAGE_KEY)) || 0
    let historyElementsArray = JSON.parse(localStorage.getItem(HISTORY_OBJECT_LOCAL_STORAGE_KEY)) || []

    //creates history record object, pushes it to the array
    function createRecord(shortenedLink, firstLink){
        let dateObj = new Date()
        let currentTime
        if(dateObj.getMinutes() <=9){
            ///add date and year
            currentTime = dateObj.getHours() + ":0" + dateObj.getMinutes() + "\n" + dateObj.getMonth() + "." + dateObj.getDay()  + "." + dateObj.getFullYear().toString().substring(2) 
        } else { currentTime = dateObj.getHours() + ":" + dateObj.getMinutes() + "\n" + dateObj.getMonth() + "." + dateObj.getDay()  + "." + dateObj.getFullYear().toString().substring(2) }

        let historyObject =  createLinkHistoryObject(shortenedLink, firstLink, currentTime)
        historyElementsArray.push(historyObject)

        historyElementIndex++
        buttonCanCopy = true
        playAnimationAfterShortening = true
        checkButtonState()
        saveAndRender()
    }

    //returns an object with the unique id, old link, and shortened one
    function createLinkHistoryObject(shortenedLink, firstLink, currentTime){
        return {
            id: historyElementIndex,
            shortLink: shortenedLink,
            longLink: firstLink,
            time: currentTime
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



    /*function addTodoTask(text) {
        if (text && text != ' ') {
            let toDo = `<li class="todoitem" data-sort="${addCounter}">
            <input type="checkbox"  class="todo" name="todo" value="todo">
            <span class="todo-text">${text} <div class="delete"></div></span>
            </li>`
    
            addCounter++;
    
            todoslist.innerHTML += toDo;
    
            todoslist.addEventListener('click', lineThrough);
    
        }
    } */

    //first the function clears links container, then creates DOM elements and assings array objects values to them
    function render(){
        clearElement(linksContainer)
        for(let i = historyElementsArray.length-1; i >= 0; i--){
            

            let container = document.createElement("div")
            container.classList.add("prev-link-and-result")
            if(playAnimationAfterShortening){
                container.classList.add("container-animation")
                playAnimationAfterShortening = false
            }
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

            let dateAndDelete = document.createElement("div")
            dateAndDelete.classList.add("date-and-delete")
            container.appendChild(dateAndDelete)


            let deleteIcon = document.createElement("img")
            deleteIcon.classList.add("trashBin")
            deleteIcon.src = "/img/trash.png"
            deleteIcon.dataset.index = historyElementsArray[i].id
            deleteIcon.addEventListener("click", deleteElement)
            dateAndDelete.appendChild(deleteIcon)

            let date = document.createElement("p")
            date.classList.add("date")
            date.innerText = historyElementsArray[i].time
            dateAndDelete.appendChild(date)
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

    //navigator returns promise so function to copy text is asynchronous
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
        timeout = setTimeout(changeMessage, 850);
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

