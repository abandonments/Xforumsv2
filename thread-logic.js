import { doc, getDoc, collection, query, where, orderBy, onSnapshot, addDoc, updateDoc, increment, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { db, auth, $ } from './config.js';

const params = new URLSearchParams(window.location.search);
const threadId = params.get('id');

function drawPost(author, content, date, isReply = false) {
    const avatar = `https://ui-avatars.com/api/?name=${author}&background=random&color=fff`;
    return `
        <table class="tborder" style="margin-bottom: 10px;">
            <tr class="${isReply ? 'trow2' : 'trow1'}">
                <td style="width: 150px; text-align: center; vertical-align: top; border-right: 1px solid var(--border); padding: 15px;">
                    <img src="${avatar}" style="width: 70px; height: 70px; border: 1px solid var(--accent); margin-bottom: 5px;">
                    <div style="font-weight: bold; color: var(--accent); font-size: 13px;">${author}</div>
                </td>
                <td style="padding: 15px; vertical-align: top;">
                    <div style="font-size: 10px; color: var(--text-muted); border-bottom: 1px solid var(--border); padding-bottom: 5px; margin-bottom: 10px;">${date}</div>
                    <div style="line-height: 1.5; white-space: pre-wrap;">${content}</div>
                </td>
            </tr>
        </table>`;
}

async function loadThread() {
    if (!threadId) return;

    // Load Main Post
    const snap = await getDoc(doc(db, "threads", threadId));
    if (snap.exists()) {
        const d = snap.data();
        $('#original-post').innerHTML = drawPost(d.author, d.content, d.createdAt?.toDate().toLocaleString() || "Recently");
        $('#breadcrumb-title').textContent = d.title;
        $('#breadcrumb-category').textContent = d.category;
    }

    // Listen for Replies
    const q = query(collection(db, "replies"), where("threadId", "==", threadId), orderBy("createdAt", "asc"));
    onSnapshot(q, (snapshot) => {
        const list = $('#replies-list');
        list.innerHTML = "";
        snapshot.forEach(doc => {
            const r = doc.data();
            list.innerHTML += drawPost(r.author, r.content, r.createdAt?.toDate().toLocaleString() || "Just now", true);
        });
    });
}

$('#submitReply').onclick = async () => {
    const text = $('#replyText').value.trim();
    if (!text || !auth.currentUser) return;

    await addDoc(collection(db, "replies"), {
        threadId: threadId,
        content: text,
        author: auth.currentUser.displayName || auth.currentUser.email.split('@')[0],
        createdAt: serverTimestamp()
    });

    await updateDoc(doc(db, "threads", threadId), { replyCount: increment(1) });
    $('#replyText').value = "";
};

onAuthStateChanged(auth, (user) => {
    $('#reply-box').style.display = user ? 'block' : 'none';
    $('#login-to-reply').style.display = user ? 'none' : 'block';
});

loadThread();
