'use client';

import { useState, useEffect } from "react";
import axios from "axios";
import config from "@/app/config";
import Swal from "sweetalert2";
import Modal from "@/app/components/modal";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";

export default function Page() {
    const [totalRepairRecord, setTotalRepairRecord] = useState(0);
    const [totalRepairRecordActive, setTotalRepairRecordActive] = useState(0);
    const [totalRepairRecordRepairing, setTotalRepairRecordRepairing] = useState(0);
    const [totalRepairRecordDone, setTotalRepairRecordDone] = useState(0);
    const [totalRepairRecordStatus, setTotalRepairRecordStatus] = useState(0);
    const [totalRepairRecordCustomer, setTotalRepairRecordCustomer] = useState(0);
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

    const router = useRouter();

    // Fetch ข้อมูลเริ่มต้น
    useEffect(() => {
        fetchRepairRecords();
        fetchEngineers();
        fetchData();
        fetchDataIncomePerDay();
    }, []);

    const fetchData = async () => {
        
        await fetchDataIncomePerDay();
    };

    // ดึงข้อมูลรายการซ่อม
    const fetchRepairRecords = async () => {
        try {
            const response = await axios.get(`${config.apiUrl}/api/repairRecord/list`);
            const filteredRecords = response.data.filter((record: any) => record.status !== 'complete');
            setRepairRecords(filteredRecords);
            setTempRepairRecords(filteredRecords); // เก็บข้อมูลที่กรองแล้วไว้ใน tempRepairRecords
        } catch (error: any) {
            Swal.fire({
                icon: 'error',
                title: 'error',
                text: error.message,
            });
        }
    };

    // ดึงข้อมูลช่างซ่อม
    const fetchEngineers = async () => {
        try {
            const response = await axios.get(`${config.apiUrl}/api/user/listEngineer`);
            setEngineers(response.data);
            setEngineerId(response.data[0]?.id || 0); // กำหนดค่าเริ่มต้นให้ engineerId
        } catch (error: any) {
            Swal.fire({
                icon: 'error',
                title: 'error',
                text: error.message,
            });
        }
    };

    // ดึงข้อมูลแดชบอร์ด
    const fetchDataIncomePerDay = async () => {
        try {
            const response = await axios.get(`${config.apiUrl}/api/repairRecord/dashboard`);
            if (response.data) {
                setTotalRepairRecord(response.data.totalRepairRecord || 0);
                setTotalRepairRecordActive(response.data.totalRepairRecordActive || 0);
                setTotalRepairRecordRepairing(response.data.totalRepairRecordRepairing || 0);
                setTotalRepairRecordDone(response.data.totalRepairRecordDone || 0);
                setTotalRepairRecordStatus(response.data.totalRepairRecordStatus || 0);
                setTotalRepairRecordCustomer(response.data.totalRepairRecordCustomer || 0);
            }
        } catch (error: any) {
            Swal.fire({
                icon: 'error',
                title: 'การดึงข้อมูลล้มเหลว',
                text: error.message,
            });
        }
    };

    // กรองข้อมูลตามสถานะ
    const handleFilter = (statusForFilter: string) => {
        if (statusForFilter) {
            const filteredRecords = tempRepairRecords.filter((repairRecord: any) =>
                repairRecord.status === statusForFilter && repairRecord.status !== 'complete'
            );
            setRepairRecords(filteredRecords);
        } else {
            const filteredRecords = tempRepairRecords.filter((repairRecord: any) =>
                repairRecord.status !== 'complete'
            );
            setRepairRecords(filteredRecords);
        }
        setStatusForFilter(statusForFilter);
    };

    // บันทึกการเปลี่ยนแปลงสถานะ
    const handleSave = async () => {
        try {
            if (status === 'repairing' && engineerId === 0) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'กรุณาเลือกช่างซ่อมก่อนบันทึก',
                });
                return;
            }

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
                endJobDate: status === 'done' ? new Date().toISOString() : null,
            };

            await axios.put(`${config.apiUrl}/api/repairRecord/updateStatus/${id}`, payload);

            // รีเฟรชข้อมูลหลังจากอัปเดตสถานะ
            await fetchRepairRecords();
            setShowModal(false); // ปิด Modal หลังบันทึกสำเร็จ
        } catch (error: any) {
            Swal.fire({ icon: 'error', title: 'error', text: error.message });
        }
    };

    // เปิด Modal และตั้งค่าข้อมูลเริ่มต้น
    const handleEdit = (id: number) => {
        const repairRecord = repairRecords.find((repairRecord: any) => repairRecord.id === id) as any;
        if (repairRecord) {
            setEngineerId(repairRecord?.engineerId ?? 0);
            setId(id);
            setStatus(repairRecord?.status ?? '');
            setSolving(repairRecord?.solving ?? '');
            setShowModal(true);
        }
    };

    // จัดการการคลิกการ์ด
    const handleCardClick = async (repairRecord: any) => {
        if (repairRecord.status === 'active') {
            try {
                await axios.put(`${config.apiUrl}/api/repairRecord/updateStatus/${repairRecord.id}`, {
                    status: 'repairing',
                });
                await fetchRepairRecords(); // รีเฟรชข้อมูล
                handleEdit(repairRecord.id); // เปิด Modal
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
                payDate = new Date().toISOString();
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                newStatus = "repairing";
            }

            try {
                await axios.put(`${config.apiUrl}/api/repairRecord/updateStatus/${repairRecord.id}`, {
                    status: newStatus,
                    payDate: payDate,
                });
                await fetchRepairRecords(); // รีเฟรชข้อมูล
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

    // แสดงชื่อสถานะ
    const getStatusName = (status: string) => {
        const statusObj = statusList.find((item: any) => item.value === status);
        return statusObj?.label ?? 'รอซ่อม';
    };

    // แสดงสีสถานะ
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
    };

    return (
        <>
            <div className="text-2xl font-bold text-white">Downtime Dashboard Monitoring</div>
            <div className="card">
                <div className="flex mt-3 gap-4">
                    {/* แสดงข้อมูลแดชบอร์ด */}
                    <div className="w-1/5 bg-indigo-600 p-4 rounded-lg text-right">
                        <div className="text-xl font-bold">งานซ่อมทั้งหมด</div>
                        <div className="text-4xl font-bold">{totalRepairRecordStatus}</div>
                    </div>
                    <div className="w-1/5 bg-red-600 p-4 rounded-lg text-right">
                        <div className="text-xl font-bold">งานรอซ่อม</div>
                        <div className="text-4xl font-bold">{totalRepairRecordActive}</div>
                    </div>
                    <div className="w-1/5 bg-yellow-300 p-4 rounded-lg text-right">
                        <div className="text-xl font-bold text-black">งานกำลังซ่อม</div>
                        <div className="text-4xl font-bold text-black">{totalRepairRecordRepairing}</div>
                    </div>
                    <div className="w-1/5 bg-green-400 p-4 rounded-lg text-right">
                        <div className="text-xl font-bold">งานรอตรวจรับ</div>
                        <div className="text-4xl font-bold">{totalRepairRecordDone}</div>
                    </div>
                    <div className="w-1/5 bg-blue-400 p-4 rounded-lg text-right">
                        <div className="text-xl font-bold">งานรอลูกค้า</div>
                        <div className="text-4xl font-bold">{totalRepairRecordCustomer}</div>
                    </div>
                </div>
                <div>
                    {/* Dropdown สำหรับกรองสถานะ */}
                    <select
                        className="form-control mt-10"
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
                        {/* แสดงการ์ดรายการซ่อม */}
                        {repairRecords.map((repairRecord: any) => (
                            <div
                                key={repairRecord.id}
                                className={`p-4 rounded-lg ${getStatusColor(repairRecord.status)} w-full md:w-[48%] lg:w-[32%] cursor-pointer`}
                                onClick={() => handleCardClick(repairRecord)}
                            >
                                <h2 className="text-xl font-bold mb-4 text-black">{getStatusName(repairRecord.status)}</h2>
                                <div className="mb-4 p-4 bg-white rounded-lg shadow text-black">
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
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Modal สำหรับปรับสถานะ */}
            <Modal title="ปรับสถานะ" isOpen={showModal} onClose={() => setShowModal(false)}>
                <div>
                    <div className="flex gap-4">
                        <div className="w-1/2">
                            <div>Add Status</div>
                            <div>
                                <select
                                    className="form-control w-full"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                >
                                    {statusList
                                        .filter((item) => status === 'done' || item.value !== 'complete')
                                        .map((item) => (
                                            <option value={item.value} key={item.value}>
                                                {item.label}
                                            </option>
                                        ))}
                                </select>
                            </div>
                        </div>
                        <div className="w-1/2">
                            <div>Select Tech</div>
                            <div>
                                <select
                                    className="form-control w-full"
                                    value={engineerId}
                                    onChange={(e) => setEngineerId(Number(e.target.value))}
                                >
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
                        <div>Solving</div>
                        <textarea
                            className="form-control w-full"
                            rows={5}
                            value={solving}
                            onChange={(e) => setSolving(e.target.value)}
                        ></textarea>
                    </div>
                    <button className="btn-primary mt-3" onClick={handleSave}>
                        <i className="fa-solid fa-check mr-3"></i>
                        Save
                    </button>
                </div>
            </Modal>
        </>
    );
}