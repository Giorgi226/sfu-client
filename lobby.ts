
const form = document.getElementById('join-form') as HTMLFormElement
form.addEventListener('submit', (e) => {
    e.preventDefault()
    
    const invitecode = (e.target as any).room.value
    window.location.href = `/index.html?room=` + encodeURIComponent(invitecode)
})

