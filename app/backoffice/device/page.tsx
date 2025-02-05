'use client'

import { useState, useEffect } from 'react';
import config from '@/app/config';
import Swal from 'sweetalert2';
import axios from 'axios';
import Modal from '@/app/components/modal';
import dayjs from 'dayjs';

export default function Page() {
    const [devices, setDevices] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [customer, setCustomer] = useState('');
    const [product, setProduct] = useState('');
    const [name, setName] = useState('');
    const [importDate, setImportDate] = useState('');
    const [remark, setRemark] = useState('');
    const [id, setId] = useState(0);


    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await axios.get(`${config.apiUrl}/api/device/list`);
            setDevices(response.data);

        } catch (error: any) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message,
            });
        }
    }

    const handleShowModal = () => {
        setShowModal(true);
    }

    const handleCloseModal = () => {
        setShowModal(false);
    }

    const handleSave = async () => {
        try {
            const payload = {
                customer: customer,
                product: product,
                name: name,
                importDate: new Date(importDate),
                remark: remark,
            }

            if (id === 0) {
                await axios.post(`${config.apiUrl}/api/device/create`, payload);
            } else {
                await axios.put(`${config.apiUrl}/api/device/update/${id}`, payload);
            }

            setShowModal(false);
            setCustomer('');
            setProduct('');          
            setName('');
            setImportDate('');
            setRemark('');
            setId(0);

            fetchData();
        } catch (error: any) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message,
            });
        }
    }

    const handleEdit = (item: any) => {
        setId(item.id);
        setProduct(item.customer);
        setCustomer(item.product);
        setName(item.name);
        setImportDate(item.importDate);
        setRemark(item.remark);

        setShowModal(true);
    }

    const handleDelete = async (id: string) => {
        try {
            const button = await config.confirmDialog();

            if (button.isConfirmed) {
                await axios.delete(config.apiUrl + '/api/device/remove/' + id);
                fetchData();
            }
        } catch (error: any) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message,
            });
        }
    }

    return (
        <div className='card'>
            <h1>Device</h1>
            <div className='card-body'>
                <button className='btn btn-primary' onClick={handleShowModal}>
                    <i className='fa-solid fa-plus mr-2'></i>
                    Add Device
                </button>

                <table className='table'>
                    <thead>
                        <tr>
                            <th>Device Name</th>
                            <th>Customer</th>
                            <th>Product</th>
                            <th>Register</th>
                            <th>Remark</th>
                            <th style={{ width: '130px' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {devices.map((item: any) => (
                            <tr key={item.id}>
                                <td>{item.name}</td>
                                <td>{item.customer}</td>
                                <td>{item.product}</td>
                                <td>{dayjs(item.importDate).format('DD/MM/YYYY')}</td>
                                <td>{item.remark}</td>
                                <td className='text-center'>
                                    <button className='btn-edit'
                                        onClick={() => handleEdit(item)}>
                                        <i className='fa-solid fa-pen-to-square'></i>
                                    </button>
                                    <button className='btn-delete'
                                        onClick={() => handleDelete(item.id)}>
                                        <i className='fa-solid fa-trash'></i>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal title='Device' isOpen={showModal}
                onClose={handleCloseModal}>
                <div>Customer</div>
                <input type='text' className='form-control' value={customer}
                    onChange={(e) => setCustomer(e.target.value)} />

                <div className='mt-3'>Product</div>
                <input type='text' className='form-control' value={product}
                    onChange={(e) => setProduct(e.target.value)} />

                <div className='mt-3'>Device Name</div>
                <input type='text' className='form-control' value={name}
                    onChange={(e) => setName(e.target.value)} />

                <div className='mt-3'>Register Date</div>
                <input type='date' className='form-control' value={importDate}
                    onChange={(e) => setImportDate(e.target.value)} />

                <div className='mt-3'>Remark</div>
                <input type='text' className='form-control' value={remark}
                    onChange={(e) => setRemark(e.target.value)} />

                <button className='btn btn-primary mt-3' onClick={handleSave}>
                    <i className='fa-solid fa-check mr-3'></i>
                    Save
                </button>
            </Modal>
        </div>
    );
}