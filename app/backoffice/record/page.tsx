'use client';

import { useEffect, useState } from "react";
import dayjs from "dayjs";
import axios from "axios";
import config from "@/app/config";
import Swal from "sweetalert2";

export default function RecordPage() {
    const [startDate, setStartDate] = useState(dayjs().format('YYYY-MM-DD'));
    const [endDate, setEndDate] = useState(dayjs().format('YYYY-MM-DD'));
    const [listReport, setListReport] = useState<any[]>([]);
    const [engineers, setEngineers] = useState([]);
    const [engineerId, setEngineerId] = useState(0);

    useEffect(() => {
        fetchReport();
        fetchEngineers();
    }, []);

    const fetchEngineers = async () => {
        try {
            const response = await axios.get(`${config.apiUrl}/api/user/listEngineer`);
            setEngineers(response.data);
            if (response.data.length > 0) {
                setEngineerId(response.data[0].id);
            }
        } catch (error: any) {
            Swal.fire({
                icon: 'error',
                title: 'error',
                text: error.message,
            });
        }
    }

    const fetchReport = async () => {
        try {
            const res = await axios.get(`${config.apiUrl}/api/record/lists/${startDate}/${endDate}`);
            setListReport(res.data);
        } catch (error: any) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message,
            });
        }
    }

    const exportToCSV = () => {
        const headers = ["Device", "Problem", "Solving", "Customer", "Start Date", "Engineer", "End Job Date", "End Date"];
        const csvContent = [
            headers.join(","), // Header row
            ...listReport.map(item => {
                const engineer = engineers.find(engineer => engineer.id === item.engineerId);
                const endDate = item.status === 'done' && item.endDate ? item.endDate : (item.status !== 'done' ? dayjs().format('DD/MM/YYYY HH:mm') : '-');
                const payDate = item.status === 'complete' && item.payDate ? item.payDate : (item.status !== 'complete' ? dayjs().format('DD/MM/YYYY HH:mm') : '-');
                return [
                    `"${item.deviceName}"`,
                    `"${item.problem}"`,
                    `"${item.solving}"`,
                    `"${item.customerName}"`,
                    `"${dayjs(item.createdAt).format('DD/MM/YYYY HH:mm')}"`,
                    `"${engineer ? engineer.username : '-'}"`,
                    `"${item.endJobDate ? dayjs(item.endJobDate).format('DD/MM/YYYY HH:mm') : '-'}"`,
                    `"${payDate !== '-' ? dayjs(payDate).format('DD/MM/YYYY HH:mm') : '-'}"`
                ].join(",");
            })
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "report.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    return (
        <div className="card">
            <h1>Records Complete (บันทึกข้อมูลเรียบร้อย)</h1>
            <div className="flex gap-4 items-center">
                <div className="w-[80px] text-right">For Date</div>
                <div className="w-[200px]">
                    <input type="date" className="form-control w-full"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div className="w-[80px] text-right">To Date</div>
                <div className="w-[200px]">
                    <input type="date" className="form-control w-full"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)} />
                </div>
                <div className="w-[200px]">
                    <button className="btn-primary" style={{ marginTop: '5px' }} onClick={fetchReport}>
                        <i className="fa-solid fa-search mr-3"></i>
                        Search
                    </button>
                </div>
                <div className="w-[200px]">
                    <button
                        className="btn-primary"
                        style={{
                            marginTop: '5px',
                            backgroundColor: '#28a745', // Green color
                            color: 'white' // White text color
                        }}
                        onClick={exportToCSV}
                    >
                        <i className="fa-solid fa-download mr-3"></i>
                        Export to CSV
                    </button>
                </div>
            </div>

            <table className="table table-bordered table-striped mt-4">
                <thead>
                    <tr>
                        <th>Device</th>
                        <th>Problem</th>
                        <th>Solving</th>
                        <th>Employee</th>
                        <th>Start Date</th>
                        <th>Technician</th>
                        <th>End Job Date</th>
                        <th>End Date</th>
                    </tr>
                </thead>
                <tbody>
                    {listReport.length > 0 && listReport.map((item, index) => {
                        const engineer = engineers.find(engineer => engineer.id === item.engineerId);

                        const payDate = item.status === 'complete' && item.payDate ? item.payDate : (item.status !== 'complete' ? dayjs().format('DD/MM/YYYY HH:mm') : '-');

                        return (
                            <tr key={index}>
                                <td>{item.deviceName}</td>
                                <td>{item.problem}</td>
                                <td>{item.solving}</td>
                                <td>{item.customerName}</td>
                                <td>{dayjs(item.createdAt).format('DD/MM/YYYY HH:mm')}</td>
                                <td>{engineer ? engineer.username : '-'}</td>
                                <td>{item.endJobDate ? dayjs(item.endJobDate).format('DD/MM/YYYY HH:mm') : '-'}</td>
                                <td>{payDate !== '-' ? dayjs(payDate).format('DD/MM/YYYY HH:mm') : '-'}</td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}