'use client';

import { useState, useEffect } from 'react';
import Modal from '../../components/modal';
import Swal from 'sweetalert2';
import config from '../../config';
import axios from 'axios';
import dayjs from 'dayjs';

export default function Page() {
    const [devices, setDevices] = useState<any[]>([]); // Initialize as an empty array
    const [repairRecords, setRepairRecords] = useState([]);

    const [showModal, setShowModal] = useState(false);
    const [customerName, setCustomerName] = useState('');
    const [deviceName, setDeviceName] = useState('');
    const [deviceCustomer, setDeviceCustomer] = useState('');
    const [deviceProduct, setDeviceProduct] = useState('');
    const [problem, setProblem] = useState('');
    const [solving, setSolving] = useState('');
    const [deviceId, setDeviceId] = useState('');
    const [importDate, setImportDate] = useState('');
    const [id, setId] = useState(0);

    const [showModalReceive, setShowModalReceive] = useState(false);
    const [receiveCustomerName, setReceiveCustomerName] = useState('');
    const [receiveAmount, setReceiveAmount] = useState(0);
    const [receiveId, setReceiveId] = useState(0);

    useEffect(() => {
        fetchDevices();
        fetchRepairRecords();
    }, []);

    const fetchDevices = async () => {
        const response = await axios.get(`${config.apiUrl}/api/device/list`);
        setDevices(response.data);
    }

    const openModal = () => {
        setShowModal(true);
    }

    const closeModal = () => {
        setShowModal(false);
        resetForm(); // รีเซ็ตฟอร์มเป็นค่าเริ่มต้น
    }

    const fetchRepairRecords = async () => {
        try {
            const response = await axios.get(`${config.apiUrl}/api/repairRecord/list`);
            // กรองข้อมูลที่ไม่รวมสถานะ 'complete'
            const filteredRecords = response.data.filter((record: any) => record.status !== 'complete');
            setRepairRecords(filteredRecords);
        } catch (error: any) {
            Swal.fire({
                icon: 'error',
                title: 'error',
                text: error.message,
            });
        }
    }

    // const fetchRepairRecords = async () => {
    //     try {
    //         const response = await axios.get(`${config.apiUrl}/api/repairRecord/list`);
    //         // กรองข้อมูลที่ไม่รวมสถานะ 'done' และ 'complete'
    //         const filteredRecords = response.data.filter((record: any) => record.status !== 'done' && record.status !== 'complete');
    //         setRepairRecords(filteredRecords);
    //     } catch (error: any) {
    //         Swal.fire({
    //             icon: 'error',
    //             title: 'error',
    //             text: error.message,
    //         });
    //     }
    // }

    const handleDeviceChange = (deviceId: string) => {
        const device = (devices as any).find((device: any) => device.id === parseInt(deviceId));

        if (device) {
            setDeviceId(device.id);
            setDeviceName(device.name);
            setDeviceCustomer(device.customer);
            setDeviceProduct(device.product);
            setImportDate(dayjs(device.import_date).format('YYYY-MM-DD'));
        } else {
            setDeviceId('');
            setDeviceName('');
            setDeviceCustomer('');
            setDeviceProduct('');
            setImportDate('');
        }
    }

    const checkDuplicateDevice = async (deviceName: string) => {
        try {
            const response = await axios.get(`${config.apiUrl}/api/repairRecord/list`);
            const activeRecords = response.data.filter((record: any) => record.status !== 'complete');
            const isDuplicate = activeRecords.some((record: any) => record.deviceName === deviceName);
            return isDuplicate;
        } catch (error: any) {
            Swal.fire({
                icon: 'error',
                title: 'error',
                text: error.message,
            });
            return false;
        }
    }

    const resetForm = () => {
        setCustomerName('');
        setDeviceId('');
        setDeviceName('');
        setDeviceCustomer('');
        setDeviceProduct('');
        setImportDate('');
        setProblem('');
        setSolving('');
        setId(0);
    };

    const handleSave = async () => {
        const isDuplicate = await checkDuplicateDevice(deviceName);

        if (isDuplicate) {
            Swal.fire({
                icon: 'error',
                title: 'ชื่ออุปกรณ์ซ้ำ',
                text: 'ชื่ออุปกรณ์นี้มีอยู่ในระบบแล้วและยังไม่เสร็จสิ้น',
            });
            return;
        }

        const payload = {
            customerName: customerName,
            deviceId: deviceId == '' ? undefined : deviceId,
            deviceName: deviceName,
            deviceCustomer: deviceCustomer,
            deviceProduct: deviceProduct,
            importDate: importDate == '' ? undefined : new Date(importDate),
            problem: problem,
            solving: solving
        }

        try {
            if (id == 0) {
                await axios.post(`${config.apiUrl}/api/repairRecord/create`, payload);
            } else {
                await axios.put(`${config.apiUrl}/api/repairRecord/update/${id}`, payload);
                setId(0);
            }

            Swal.fire({
                icon: 'success',
                title: 'บันทึกข้อมูล',
                text: 'บันทึกข้อมูลเรียบร้อย',
                timer: 1000
            });

            closeModal();
            fetchRepairRecords(); // รีเฟรชข้อมูลหลังจากบันทึก
            resetForm(); // รีเซ็ตฟอร์มเป็นค่าเริ่มต้น
        } catch (error: any) {
            Swal.fire({
                icon: 'error',
                title: 'error',
                text: error.message,
            });
        }
    }

    const getStatusName = (status: string) => {
        switch (status) {
            case 'active':
                return 'รอซ่อม (active)';
            case 'pending':
                return 'รอลูกค้ายืนยัน (pending)';
            case 'repairing':
                return 'กำลังซ่อม (repairing)';
            case 'done':
                return 'ซ่อมเสร็จ (done)';
            default:
                return 'รอซ่อม (active)';
        }
    }

    const handleEdit = (repairRecord: any) => {
        setId(repairRecord.id);
        setCustomerName(repairRecord.customerName);

        if (repairRecord.deviceId) {
            setDeviceId(repairRecord.deviceId);
        }

        setDeviceName(repairRecord.deviceName);
        setDeviceCustomer(repairRecord.deviceCustomer);
        setDeviceProduct(repairRecord.deviceProduct);
        setImportDate(dayjs(repairRecord.importDate).format('YYYY-MM-DD'));
        setProblem(repairRecord.problem);
        openModal();
    }

    const handleDelete = async (id: number) => {
        const button = await config.confirmDialog();

        if (button.isConfirmed) {
            await axios.delete(`${config.apiUrl}/api/repairRecord/remove/${id}`);
            fetchRepairRecords();
        }
    }

    const openModalReceive = (repairRecord: any) => {
        setShowModalReceive(true);
        setReceiveCustomerName(repairRecord.customerName);
        setReceiveAmount(0);
        setReceiveId(repairRecord.id);
    }

    const closeModalReceive = () => {
        setShowModalReceive(false);
        setReceiveId(0); // clear id
        resetForm(); // รีเซ็ตฟอร์มเป็นค่าเริ่มต้น
    }

    // const handleReceive = async () => {
    //     const payload = {
    //         id: receiveId,
    //         amount: receiveAmount,
    //         status: 'complete' // ตั้งค่าสถานะเป็น 'complete'
    //     }

    //     try {
    //         await axios.put(`${config.apiUrl}/api/repairRecord/receive`, payload);

    //         Swal.fire({
    //             icon: 'success',
    //             title: 'รับเครื่องเรียบร้อย',
    //             text: 'ข้อมูลถูกอัปเดตแล้ว',
    //             timer: 1000
    //         });

    //         fetchRepairRecords(); // รีเฟรชข้อมูลหลังจากรับเครื่อง
    //         closeModalReceive();
    //         resetForm(); // รีเซ็ตฟอร์มเป็นค่าเริ่มต้น
    //     } catch (error: any) {
    //         Swal.fire({
    //             icon: 'error',
    //             title: 'error',
    //             text: error.message,
    //         });
    //     }
    // }

    const handleReceive = async () => {
        const payload = {
            id: receiveId,
            amount: receiveAmount,
            status: 'complete', // ตั้งค่าสถานะเป็น 'complete'
            payDate: new Date().toISOString() // เพิ่ม payDate เป็นเวลาปัจจุบัน
        }

        try {
            await axios.put(`${config.apiUrl}/api/repairRecord/receive`, payload);

            Swal.fire({
                icon: 'success',
                title: 'รับเครื่องเรียบร้อย',
                text: 'ข้อมูลถูกอัปเดตแล้ว',
                timer: 1000
            });

            fetchRepairRecords(); // รีเฟรชข้อมูลหลังจากรับเครื่อง
            closeModalReceive();
            resetForm(); // รีเซ็ตฟอร์มเป็นค่าเริ่มต้น
        } catch (error: any) {
            Swal.fire({
                icon: 'error',
                title: 'error',
                text: error.message,
            });
        }
    }

    return (
        <>
            <div className="card">
                <h1>Repair Record (แจ้งซ่อม)</h1>
                <div className="card-body">
                    <button className="btn-primary" onClick={openModal}>
                        <i className="fa-solid fa-plus mr-3"></i>
                        Add Problem
                    </button>

                    <table className="table mt-3">
                        <thead>
                            <tr>
                                <th>EN.</th>
                                <th>Device Name</th>
                                <th>Problem</th>
                                <th>Start Date</th>
                                <th>End Date</th>
                                <th>Status</th>
                                {/* <th className="text-right" style={{ paddingRight: '4px' }}>ค่าบริการ</th> */}
                                <th style={{ width: '140px' }}></th>
                            </tr>
                        </thead>

                        <tbody>
                            {repairRecords.map((repairRecord: any, index: number) => (
                                <tr key={index}>
                                    <td>{repairRecord.customerName}</td>
                                    <td>{repairRecord.deviceName}</td>
                                    <td>{repairRecord.problem}</td>
                                    <td>{dayjs(repairRecord.createdAt).format('DD/MM/YYYY HH:mm')}</td>
                                    <td>{repairRecord.endJobDate ? dayjs(repairRecord.endJobDate).format('DD/MM/YYYY HH:mm') : '-'}</td>
                                    <td>{getStatusName(repairRecord.status)}</td>
                                    
                                    <td>
                                        {/* <button
                                            className="btn-edit"
                                            onClick={() => openModalReceive(repairRecord)}
                                            disabled={repairRecord.status !== 'done'} // ปิดการใช้งานถ้าสถานะไม่ใช่ 'done'
                                            style={{ opacity: repairRecord.status !== 'done' ? 0.5 : 1, cursor: repairRecord.status !== 'done' ? 'not-allowed' : 'pointer' }}
                                        >
                                            <i className="fa-solid fa-check mr-3"></i>
                                            Complate
                                        </button> */}
                                        <button className="btn-edit" onClick={() => handleEdit(repairRecord)}>
                                            <i className="fa-solid fa-edit mr-3"></i>
                                            Edit
                                        </button>
                                        {/* <button className="btn-delete" onClick={() => handleDelete(repairRecord.id)}>
                                            <i className="fa-solid fa-trash mr-3"></i>
                                            Delete
                                        </button> */}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal title="Add Problem" isOpen={showModal} onClose={() => closeModal()} size="xl">
                <div className='flex gap-4'>
                    <div className='w-full'>
                        <div>EN.</div>
                        <input type="text"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            className="form-control w-full" />
                    </div>
                </div>

                <div className='mt-4'>Device (In System)</div>
                <select className="form-control w-full" value={deviceId}
                    onChange={(e) => handleDeviceChange(e.target.value)}>
                    <option value="">--- Select Device ---</option>
                    {Array.isArray(devices) && devices.map((device: any) => (
                        <option key={device.id} value={device.id}>
                            {device.name}
                        </option>
                    ))}
                </select>

                <div className='mt-4'>Device (Out System)</div>
                <input
                    type="text"
                    value={deviceName}
                    onChange={(e) => setDeviceName(e.target.value.toUpperCase())} // แปลงเป็นตัวพิมพ์ใหญ่
                    className="form-control w-full"
                />

                <div className="flex gap-4 mt-4">
                    <div className="w-1/2">
                        <div>Customer</div>
                        <input type="text"
                            value={deviceCustomer}
                            onChange={(e) => setDeviceCustomer(e.target.value)}
                            className="form-control w-full" />
                    </div>

                    <div className="w-1/2">
                        <div>Product</div>
                        <input type="text"
                            value={deviceProduct}
                            onChange={(e) => setDeviceProduct(e.target.value)}
                            className="form-control w-full" />
                    </div>
                </div>

                {/* <div className="mt-4">อาการเสีย (Problem)</div>
                <textarea className="form-control w-full"
                    value={problem}
                    onChange={(e) => setProblem(e.target.value)}>
                </textarea>

                <button className='btn-primary mt-4' onClick={handleSave}>
                    <i className="fa-solid fa-check mr-3"></i>
                    Save
                </button> */}
                <div className="mt-4">อาการเสีย (Problem)</div>
                <textarea
                    className="form-control w-full"
                    value={problem}
                    onChange={(e) => setProblem(e.target.value.trimStart())} // ลบช่องว่างหน้า string
                ></textarea>

                <button
                    className={`btn-primary mt-4 ${!problem.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={handleSave}
                    disabled={!problem.trim()} // ปิดปุ่มถ้าไม่มีค่า
                >
                    <i className="fa-solid fa-check mr-3"></i>
                    Save
                </button>
            </Modal>

            <Modal title="รับเครื่อง" isOpen={showModalReceive} onClose={() => closeModalReceive()} size="xl">
                <div className='flex gap-4'>
                    <div className='w-1/2'>
                        <div>EN.</div>
                        <input type="text" className="form-control w-full disabled" readOnly
                            value={receiveCustomerName} />
                    </div>
                    <div className='w-1/2'>
                        <div>Cost</div>
                        <input type="text" className="form-control w-full text-right"
                            value={receiveAmount}
                            onChange={(e) => setReceiveAmount(Number(e.target.value))} />
                    </div>
                </div>

                <div>
                    <button className='btn-primary mt-4' onClick={handleReceive}>
                        <i className="fa-solid fa-check mr-3"></i>
                        Save
                    </button>
                </div>
            </Modal>
        </>
    );
}