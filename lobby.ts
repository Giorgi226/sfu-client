
const form = document.getElementById('join-form') as HTMLFormElement
form.addEventListener('submit', (e) => {
    e.preventDefault()
    
    const invitecode = (e.target as HTMLFormElement).invite_link.value
    window.location.href = `index.html?room=${invitecode}`
})

