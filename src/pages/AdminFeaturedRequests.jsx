import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';


export default function AdminFeaturedRequests() {
const [requests, setRequests] = useState([]);


useEffect(() => {
const loadRequests = async () => {
const snapshot = await getDocs(collection(db, 'featuredRequests'));
setRequests(snapshot.docs.map(docu => ({ id: docu.id, ...docu.data() })));
};
loadRequests();
}, []);


const approveRequest = async (req) => {
await updateDoc(doc(db, 'products', req.productId), { isFeatured: true });
await deleteDoc(doc(db, 'featuredRequests', req.id));
setRequests(prev => prev.filter(r => r.id !== req.id));
};


const rejectRequest = async (id) => {
await deleteDoc(doc(db, 'featuredRequests', id));
setRequests(prev => prev.filter(r => r.id !== id));
};


return (
<div>
<h2>Featured Requests</h2>
{requests.map(req => (
<div key={req.id}>
<p>Product ID: {req.productId}</p>
<p>Seller: {req.sellerId}</p>
<button onClick={() => approveRequest(req)}>Approve</button>
<button onClick={() => rejectRequest(req.id)}>Reject</button>
</div>
))}
</div>
);
}