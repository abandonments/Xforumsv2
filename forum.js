import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { db, auth, $ } from './config.js';

export function initForum(categoryID, categoryName) {
    const list = $('#postsList');
    const newPostBtn = $('#newPostBtn');
    const modal = $('#modal');
    const postForm = $('#postForm');

    onAuthStateChanged(auth, (user) => {
        newPostBtn.disabled = !user;
        newPostBtn.textContent = user ? "+ Post New Thread" : "Login to Post";
    });

    // Real-time listener for thread updates
    const q = query(collection(db, "threads"), where("category", "==", categoryID), orderBy("createdAt", "desc"));
    onSnapshot(q, (snapshot) => {
        list.innerHTML = snapshot.empty ? `<tr class="trow1"><td colspan="3" style="text-align:center; padding:30px;">No threads in ${categoryName}.</td></tr>` : '';
        
        snapshot.forEach((doc, index) => {
            const data = doc.data();
            const date = data.createdAt?.toDate() ? data.createdAt.toDate().toLocaleDateString() : "Just now";
            const tr = document.createElement('tr');
            tr.className = index % 2 === 0 ? 'trow1' : 'trow2';
            tr.innerHTML = `
                <td style="padding: 12px 15px;">
                    <a href="thread.html?id=${doc.id}" style="font-weight:bold; color:var(--accent); font-size:1.1rem;">${data.title}</a>
                    <div style="font-size:0.75rem; color:var(--text-muted); margin-top:4px;">Started by <strong>${data.author}</strong></div>
                </td>
                <td style="text-align:center; color:var(--text-muted);">0</td>
                <td style="text-align:right; font-size:0.8rem; padding-right:15px;">
                    <div style="color:var(--accent); font-weight:bold;">${data.author}</div>
                    <div style="color:var(--text-muted);">${date}</div>
                </td>`;
            list.appendChild(tr);
        });
    });

    if (newPostBtn) newPostBtn.onclick = () => modal.style.display = 'flex';
    if ($('#cancelBtn')) $('#cancelBtn').onclick = () => modal.style.display = 'none';

    postForm.onsubmit = async (e) => {
        e.preventDefault();
        const user = auth.currentUser;
        if (!user) return;

        try {
            await addDoc(collection(db, "threads"), {
                title: $('#postTitle').value,
                content: $('#postContent').value,
                category: categoryID,
                author: user.displayName || user.email.split('@')[0],
                authorId: user.uid,
                createdAt: serverTimestamp()
            });
            postForm.reset();
            modal.style.display = 'none';
        } catch (err) { alert("Error: " + err.message); }
    };
}
