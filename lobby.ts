
document.addEventListener('DOMContentLoaded', () => {  
const form = document.getElementById('join-form') as HTMLFormElement
 if (!form) {
    console.error('Join form not found!');
    return;
  }
form.addEventListener('submit', (e) => {
    e.preventDefault()
    
    const invitecode = (e.target as any).room.value
    const newUrl = `${window.location.origin}/index.html?room=${encodeURIComponent(invitecode)}`;
    console.log('Redirecting to:', newUrl);
    window.location.replace(newUrl);
})
});

