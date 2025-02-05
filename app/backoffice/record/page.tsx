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

    // const fetchEngineers = async () => {
    //     try {
    //         const response = await axios.get(`${config.apiUrl}/api/user/listEngineer`);
    //         console.log("Engineers Data:", response.data); // ตรวจสอบข้อมูลใน console
    //         setEngineers(response.data);
    //         if (response.data.length > 0) {
    //             setEngineerId(response.data[0].id);
    //         }
    //     } catch (error: any) {
    //         Swal.fire({
    //             icon: 'error',
    //             title: 'Error',
    //             text: error.message,
    //         });
    //     }
    // }
    
    // const fetchReport = async () => {
    //     try {
    //         const res = await axios.get(`${config.apiUrl}/api/record/lists/${startDate}/${endDate}`);
    //         console.log("Report Data:", res.data); // ตรวจสอบข้อมูลใน console
    //         setListReport(res.data);
    //     } catch (error: any) {
    //         Swal.fire({
    //             icon: 'error',
    //             title: 'Error',
    //             text: error.message,
    //         });
    //     }
    // }

    const fetchEngineers = async () => {
        try {
            const response = await axios.get(`${config.apiUrl}/api/user/listEngineer`);
            setEngineers(response.data);
            if (response.data.length > 0) {
                setEngineerId(response.data[0].id);
            }
            setEngineerId(response.data[0].id);
        } catch (error: any) {
            Swal.fire({
                icon: 'error',
                title: 'error',
                text: error.message,
            });
        }
    }

    const fetchReport = async () => {
        const res = await axios.get(config.apiUrl + `/api/record/lists/${startDate}/${endDate}`);
        setListReport(res.data)
    }

    return (
        <div className="card">
            <h1>Repair Records</h1>
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
            </div>

            <table className="table table-bordered table-striped mt-4">
                    <thead>
                        <tr>
                            <th>EN.</th>
                            <th>Device</th>
                            <th>Problem</th>
                            <th>solving</th>
                            <th>Tech</th>                            
                            <th>StartJobDate</th>
                            <th>EndJobDate</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {listReport.length > 0 && listReport.map((item, index) => {
                            const engineer = engineers.find(engineer => engineer.id === item.engineerId);
                            return (
                            <tr key={index}>
                                <td>{item.customerName}</td>
                                <td>{item.deviceName}</td>
                                <td>{item.problem}</td>
                                <td>{item.solving}</td>
                                <td>{engineer?engineer.username: '-'}</td>
                                <td>{dayjs(item.createdAt).format('DD/MM/YYYY HH:mm')}</td>
                                <td>{dayjs(item.payDate).format('DD/MM/YYYY HH:mm')}</td>
                                <td>{item.status}</td>
                            </tr>
                            )
                        })}
                    </tbody>
                </table>
        </div>
    )
}