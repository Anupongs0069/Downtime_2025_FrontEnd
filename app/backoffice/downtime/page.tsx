'use client';

import { useState, useEffect } from "react";
import axios from "axios";
import config from "@/app/config";
import Swal from "sweetalert2";
import Modal from "@/app/components/modal";
import dayjs from "dayjs";
import { useRouter } from "next/navigation"; // Import useRouter จาก next/navigation

export default function Page() {
    const [repairRecords, setRepairRecords] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [id, setId] = useState(0);
    const [status, setStatus] = useState('');
    const [solving, setSolving] = useState('');
    const [statusList, setStatusList] = useState([
        { value: 'active', label: 'รอซ่อม (active)' },
        { value: 'pending', label: 'รอลูกค้ายืนยัน (panding)' },
        { value: 'repairing', label: 'กำลังซ่อม (repairing)' },
        { value: 'done', label: 'ซ่อมเสร็จ (done)' },
        
    ]);
    const [statusForFilter, setStatusForFilter] = useState('');
    const [tempRepairRecords, setTempRepairRecords] = useState([]);
    const [engineers, setEngineers] = useState([]);
    const [engineerId, setEngineerId] = useState(0);
    const [prevStatus, setPrevStatus] = useState('');

    const router = useRouter(); // ใช้ useRouter สำหรับการนำทาง

    useEffect(() => {
        fetchRepairRecords();
        fetchEngineers();
    }, []);

    // เมื่อมีการโหลดข้อมูล repair record
    // useEffect(() => {
    //     const fetchData = async () => {
    //         const response = await axios.get(`${config.apiUrl}/api/repairRecord/${id}`);
    //         setPrevStatus(response.data.status);
    //     };
    //     fetchData();
    // }, [id]);

    const fetchEngineers = async () => {
        try {
            const response = await axios.get(`${config.apiUrl}/api/user/listEngineer`);
            setEngineers(response.data);
            setEngineerId(response.data[0].id);
        } catch (error: any) {
            Swal.fire({
                icon: 'error',
                title: 'error',
                text: error.message,
            });
        }
    }

    const fetchRepairRecords = async () => {
        try {
            const response = await axios.get(`${config.apiUrl}/api/repairRecord/list`);
            // กรองข้อมูลที่ไม่รวมสถานะ 'complete'
            const filteredRecords = response.data.filter((record: any) => record.status !== 'complete');
            setRepairRecords(filteredRecords);
            setTempRepairRecords(filteredRecords); // เก็บข้อมูลที่กรองแล้วไว้ใน tempRepairRecords ด้วย
        } catch (error: any) {
            Swal.fire({
                icon: 'error',
                title: 'error',
                text: error.message,
            });
        }
    }

    const handleFilter = (statusForFilter: string) => {
        if (statusForFilter) {
            // กรองข้อมูลที่ไม่รวมสถานะ 'complete'
            const filteredRecords = tempRepairRecords.filter((repairRecord: any) =>
                repairRecord.status === statusForFilter && repairRecord.status !== 'complete'
            );
            setRepairRecords(filteredRecords);
            setStatusForFilter(statusForFilter);
        } else {
            // กรองข้อมูลที่ไม่รวมสถานะ 'complete' เมื่อไม่มีการเลือกสถานะ
            const filteredRecords = tempRepairRecords.filter((repairRecord: any) =>
                repairRecord.status !== 'complete'
            );
            setRepairRecords(filteredRecords);
            setStatusForFilter('');
        }
    }

    // const handleSave = async () => {
    //     try {
    //         const payload = {
    //             status: status,
    //             solving: solving,
    //             engineerId: engineerId,
    //             endJobDate: status === 'done' ? new Date().toISOString() : null
    //         }

    //         await axios.put(`${config.apiUrl}/api/repairRecord/updateStatus/${id}`, payload);

    //         // รีเฟรชข้อมูลหลังจากอัปเดตสถานะ
    //         fetchRepairRecords();
    //         setShowModal(false);
    //     } catch (error: any) {
    //         Swal.fire({ icon: 'error', title: 'error', text: error.message });
    //     }
    // }

    // const handleSave = async () => {
    //     try {
    //         // ตรวจสอบว่าถ้าสถานะเปลี่ยนเป็น repairing ต้องมีช่างซ่อมถูกเลือก
    //         if (status === 'repairing' && engineerId === 0) {
    //             Swal.fire({
    //                 icon: 'error',
    //                 title: 'Error',
    //                 text: 'กรุณาเลือกช่างซ่อมก่อนบันทึก',
    //             });
    //             return;
    //         }

    //         const payload = {
    //             status: status,
    //             solving: solving,
    //             engineerId: engineerId,
    //             endJobDate: status === 'done' ? new Date().toISOString() : null
    //         }

    //         await axios.put(`${config.apiUrl}/api/repairRecord/updateStatus/${id}`, payload);

    //         // รีเฟรชข้อมูลหลังจากอัปเดตสถานะ
    //         fetchRepairRecords();
    //         setShowModal(false);
    //     } catch (error: any) {
    //         Swal.fire({ icon: 'error', title: 'error', text: error.message });
    //     }
    // }

    const handleSave = async () => {
        try {
            // ตรวจสอบว่าถ้าสถานะเปลี่ยนเป็น repairing ต้องมีช่างซ่อมถูกเลือก
            if (status === 'repairing' && engineerId === 0) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'กรุณาเลือกช่างซ่อมก่อนบันทึก',
                });
                return;
            }

            // ตรวจสอบว่าถ้าสถานะเปลี่ยนเป็น done ต้องมีการกรอกข้อมูลใน solving
            if (status === 'done' && !solving?.trim()) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'กรุณากรอกข้อมูลการแก้ไขก่อนบันทึก',
                });
                return;
            }

            const payload = {
                status: status,
                solving: solving,
                engineerId: engineerId,
                endJobDate: status === 'done' ? new Date().toISOString() : null

            }

            await axios.put(`${config.apiUrl}/api/repairRecord/updateStatus/${id}`, payload);

            // รีเฟรชข้อมูลหลังจากอัปเดตสถานะ
            fetchRepairRecords();
            setShowModal(false);
        } catch (error: any) {
            Swal.fire({ icon: 'error', title: 'error', text: error.message });
        }
    }

    const getStatusName = (status: string) => {
        const statusObj = statusList.find((item: any) => item.value === status);
        return statusObj?.label ?? 'รอซ่อม';
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-red-500';
            case 'pending':
                return 'bg-blue-300';
            case 'repairing':
                return 'bg-yellow-300';
            case 'done':
                return 'bg-green-300';
            case 'complete':
                return 'bg-gray-200';
            default:
                return 'bg-red-500';
        }
    }

    const handleEdit = (id: number) => {
        const repairRecord = repairRecords.find((repairRecord: any) => repairRecord.id === id) as any;

        if (repairRecord) {
            setEngineerId(repairRecord?.engineerId ?? 0); // กำหนดช่างซ่อมตามสถานะที่มีอยู่

            setId(id);
            setStatus(repairRecord?.status ?? '');
            setSolving(repairRecord?.solving ?? '');
            setShowModal(true);
        }
    }

    // const handleCardClick = (repairRecord: any) => {
    //     if (repairRecord.status === 'active') {
    //         // นำทางไปที่หน้า repair-status พร้อมกับส่ง ID ของ repairRecord
    //         router.push(`/repair-status/${repairRecord.id}`);
    //     } else {
    //         // ถ้าไม่ใช่สถานะ active ให้เปิด Modal เพื่อแก้ไขสถานะ
    //         handleEdit(repairRecord.id);
    //     }
    // }

    // const handleCardClick = async (repairRecord: any) => {
    //     console.log("Repair Record Clicked:", repairRecord);

    //     if (repairRecord.status === 'active') {
    //         // อัปเดตสถานะเป็น 'repairing' ก่อนเปิด Modal
    //         try {
    //             await axios.put(`${config.apiUrl}/api/repairRecord/updateStatus/${repairRecord.id}`, {
    //                 status: 'repairing'
    //             });

    //             // Fetch ข้อมูลล่าสุดและเปิด Modal
    //             fetchRepairRecords();
    //             handleEdit(repairRecord.id); // เปิด Modal เพื่อปรับสถานะ
    //         } catch (error: any) {
    //             Swal.fire({
    //                 icon: 'error',
    //                 title: 'Error',
    //                 text: error.message,
    //             });
    //         }
    //     } else if (repairRecord.status === 'done') {
    //         const result = await Swal.fire({
    //             title: "ยอมรับเครื่องหรือไม่?",
    //             text: "หากยอมรับเครื่อง สถานะจะเปลี่ยนเป็น Complete",
    //             icon: "question",
    //             showCancelButton: true,
    //             confirmButtonText: "OK",
    //             cancelButtonText: "NO",
    //         });

    //         let newStatus = repairRecord.status;
    //         if (result.isConfirmed) {
    //             newStatus = "complete";
    //         } else if (result.dismiss === Swal.DismissReason.cancel) {
    //             newStatus = "repairing";
    //         }

    //         try {
    //             await axios.put(`${config.apiUrl}/api/repairRecord/updateStatus/${repairRecord.id}`, {
    //                 status: newStatus
    //             });

    //             fetchRepairRecords();
    //         } catch (error: any) {
    //             Swal.fire({
    //                 icon: 'error',
    //                 title: 'Error',
    //                 text: error.message,
    //             });
    //         }
    //     } else {
    //         handleEdit(repairRecord.id); // เปิด Modal สำหรับสถานะอื่น ๆ
    //     }
    // };

    const handleCardClick = async (repairRecord: any) => {
        console.log("Repair Record Clicked:", repairRecord);

        if (repairRecord.status === 'active') {
            // อัปเดตสถานะเป็น 'repairing' ก่อนเปิด Modal
            try {
                await axios.put(`${config.apiUrl}/api/repairRecord/updateStatus/${repairRecord.id}`, {
                    status: 'repairing'
                });

                // Fetch ข้อมูลล่าสุดและเปิด Modal
                fetchRepairRecords();
                handleEdit(repairRecord.id); // เปิด Modal เพื่อปรับสถานะ
            } catch (error: any) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message,
                });
            }
        } else if (repairRecord.status === 'done') {
            const result = await Swal.fire({
                title: "ยอมรับเครื่องหรือไม่?",
                text: "หากยอมรับเครื่อง สถานะจะเปลี่ยนเป็น Complete",
                icon: "question",
                showCancelButton: true,
                confirmButtonText: "OK",
                cancelButtonText: "NO",
            });

            let newStatus = repairRecord.status;
            let payDate = null;

            if (result.isConfirmed) {
                newStatus = "complete";
                payDate = new Date().toISOString(); // บันทึกเวลาปัจจุบันในรูปแบบ ISO string
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                newStatus = "repairing";
            }

            try {
                await axios.put(`${config.apiUrl}/api/repairRecord/updateStatus/${repairRecord.id}`, {
                    status: newStatus,
                    payDate: payDate // ส่ง payDate ไปยัง API
                });

                fetchRepairRecords();
            } catch (error: any) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message,
                });
            }
        } else {
            handleEdit(repairRecord.id); // เปิด Modal สำหรับสถานะอื่น ๆ
        }
    };

    const groupRecordsByStatus = () => {
        const grouped: { [key: string]: any[] } = {};

        repairRecords.forEach((record: any) => {
            if (!grouped[record.status]) {
                grouped[record.status] = [];
            }
            grouped[record.status].push(record);
        });

        return grouped;
    }

    const groupedRecords = groupRecordsByStatus();

    return (
        <>
            <div className="card">
                <h1>Downtime Dashboard Monitoring</h1>
                <div>
                    <select className="form-control"
                        value={statusForFilter}
                        onChange={(e) => handleFilter(e.target.value)}
                    >
                        <option value="">--- ALL STATUS ---</option>
                        {statusList.map((item: any) => (
                            <option value={item.value} key={item.value}>
                                {item.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="card-body">
                    <div className="flex flex-wrap gap-4 mt-4">
                        {repairRecords.map((repairRecord: any) => (
                            <div
                                key={repairRecord.id}
                                className={`p-4 rounded-lg ${getStatusColor(repairRecord.status)} w-full md:w-[48%] lg:w-[32%] cursor-pointer`}
                                onClick={() => handleCardClick(repairRecord)} // เพิ่ม onClick event
                            >
                                <h2 className="text-xl font-bold mb-4 text-black">{getStatusName(repairRecord.status)}</h2>
                                <div className="mb-4 p-4 bg-white rounded-lg shadow text-black">
                                    {/* แสดงรูปภาพของผู้แจ้งซ่อมหรือช่างซ่อม ขึ้นอยู่กับสถานะ */}
                                    <div className="flex items-center mb-4">
                                        {repairRecord.status === "repairing" && repairRecord.engineer?.userImage ? (
                                            <img
                                                src={repairRecord.engineer.userImage}
                                                alt="Engineer"
                                                className="w-12 h-12 rounded-full mr-4 border-2 border-blue-500"
                                            />
                                        ) : repairRecord.userImage ? (
                                            <img
                                                src={repairRecord.userImage}
                                                alt="User"
                                                className="w-12 h-12 rounded-full mr-4 border border-gray-300"
                                            />
                                        ) : (
                                            <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center mr-4">
                                                <i className="fa-solid fa-user text-gray-600 text-xl"></i>
                                            </div>
                                        )}
                                        <div className="font-bold text-lg">
                                            {repairRecord.status === "repairing" ? repairRecord.engineer?.username : repairRecord.customerName}
                                        </div>
                                    </div>
                                    <div className="font-bold">EN :{repairRecord.customerName}</div>
                                    <div>Device Name: {repairRecord.deviceName}</div>
                                    <div>Problem: {repairRecord.problem}</div>
                                    <div>Start Date: {dayjs(repairRecord.createdAt).format('DD/MM/YYYY HH:mm')}</div>
                                    <div>End Date: {repairRecord.endJobDate ? dayjs(repairRecord.endJobDate).format('DD/MM/YYYY HH:mm') : '-'}</div>
                                    <div>Solving: {repairRecord.solving || '-'}</div>
                                    <div>EN. Tech: {repairRecord.engineer?.username ?? '-'}</div>
                                    <div className="flex gap-2 mt-2">
                                        {/* <button className="btn-edit" onClick={() => handleEdit(repairRecord.id)}>
                                            <i className="fa-solid fa-edit mr-3"></i>
                                            ปรับสถานะ
                                        </button> */}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <Modal title="ปรับสถานะ" isOpen={showModal} onClose={() => setShowModal(false)}>
                <div>
                    <div className="flex gap-4">
                        <div className="w-1/2">
                            <div>Add Status</div>
                            <div>
                                <select className="form-control w-full"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                >
                                    {statusList
                                        .filter((item) => status === 'done' || item.value !== 'complete') // 🔹 กรอง complete ออก ถ้าไม่ใช่ done
                                        .map((item) => (
                                            <option value={item.value} key={item.value}>
                                                {item.label}
                                            </option>
                                        ))
                                    }
                                </select>
                            </div>
                        </div>
                        <div className="w-1/2">
                            <div>Select Tech</div>
                            <div>
                                <select className="form-control w-full"
                                    value={engineerId}
                                    onChange={(e) => setEngineerId(Number(e.target.value))}>
                                    <option value="">--- Select Tech ---</option>
                                    {engineers.map((engineer) => (
                                        <option value={engineer.id} key={engineer.id}>
                                            {engineer.username}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="mt-3">
                        <div>Sovling</div>
                        <textarea className="form-control w-full" rows={5}
                            value={solving}
                            onChange={(e) => setSolving(e.target.value)}></textarea>
                    </div>

                    <button className="btn-primary mt-3" onClick={handleSave}>
                        <i className="fa-solid fa-check mr-3"></i>
                        Save
                    </button>
                </div>
            </Modal>
        </>
    )
}