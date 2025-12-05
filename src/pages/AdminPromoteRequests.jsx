import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore';


export default function AdminPromoteRequests() {
const [requests, setRequests] = useState([]);


useEffect(() => {
const loadRequests = async () => {
const snapshot = await getDocs(collection(db, 'promotionRequests'));
setRequests(snapshot.docs.map(docu => ({ id: docu.id, ...docu.data() })));
};
loadRequests();
}, []);


const approveRequest = async (req) => {
const days = req.plan === 'Basic' ? 3 : req.plan === 'Standard' ? 7 : 15;
const expiryDate = Timestamp.fromDate(new Date(Date.now() + days * 24 * 60 * 60 * 1000));


await updateDoc(doc(db, 'products', req.productId), { promotedTill: expiryDate });
await deleteDoc(doc(db, 'promotionRequests', req.id));
setRequests(prev => prev.filter(r => r.id !== req.id));
};


const rejectRequest = async (id) => {
await deleteDoc(doc(db, 'promotionRequests', id));
setRequests(prev => prev.filter(r => r.id !== id));
};


return (
<div>
<h2>Promotion Requests</h2>
{requests.map(req => (
<div key={req.id}>
<p>Product ID: {req.productId}</p>
<p>Seller: {req.sellerId}</p>
<p>Plan: {req.plan}</p>
<button onClick={() => approveRequest(req)}>Approve</button>
<button onClick={() => rejectRequest(req.id)}>Reject</button>
</div>
))}
</div>
);
}