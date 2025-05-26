// src/components/AddUser.tsx
import React, { useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase/firebaseInitialize';

export interface User {
    name: string;
    email: string;
    age: number;
}

const AddUser: React.FC = () => {
    const [user, setUser] = useState<User>({
        name: '',
        email: '',
        age: 0,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUser((prev) => ({
            ...prev,
            [name]: name === 'age' ? parseInt(value) : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            console.log('user:', user);
            const docRef = await addDoc(collection(db, 'users'), user);
            alert(`User added with ID: ${docRef.id}`);
        } catch (error) {
            console.error('Error adding user:', error);
            alert('Failed to add user');
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input name='name' placeholder='Name' value={user.name} onChange={handleChange} required />
            <input name='email' placeholder='Email' value={user.email} onChange={handleChange} required />
            <input name='age' placeholder='Age' type='number' value={user.age} onChange={handleChange} required />
            <button type='submit'>Add User</button>
        </form>
    );
};

export default AddUser;
