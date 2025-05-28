"use strict";
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('join-form');
    if (!form) {
        console.error('Join form not found!');
        return;
    }
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const invitecode = e.target.room.value;
        const newUrl = `${window.location.origin}/index.html?room=${encodeURIComponent(invitecode)}`;
        console.log('Redirecting to:', newUrl);
        window.location.replace(newUrl);
    });
});
