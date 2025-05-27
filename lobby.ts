
document.addEventListener('DOMContentLoaded', () => {  
const form = document.getElementById('join-form') as HTMLFormElement
form.addEventListener('submit', (e) => {
    e.preventDefault()
    
    const invitecode = (e.target as any).room.value
    const newUrl = `${window.location.origin}/index.html?room=${encodeURIComponent(invitecode)}`;
    window.location.replace(newUrl);
})
});

