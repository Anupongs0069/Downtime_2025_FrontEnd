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
            </div>

            <table className="table table-bordered table-striped mt-4">
                <thead>
                    <tr>
                        <th>Device</th>
                        <th>Problem</th>
                        <th>solving</th>
                        <th>EN.</th>
                        <th>Start Date</th>
                        <th>EN. Tech</th>
                        <th>End Job Tech</th>
                        <th>End Date</th>
                        {/* <th>Status</th> */}
                    </tr>
                </thead>
                {/* <tbody>
                        {listReport.length > 0 && listReport.map((item, index) => {
                            const engineer = engineers.find(engineer => engineer.id === item.engineerId);
                            return (
                            <tr key={index}>
                                <td>{item.deviceName}</td>
                                <td>{item.problem}</td>
                                <td>{item.solving}</td> 
                                <td>{item.customerName}</td>
                                <td>{dayjs(item.createdAt).format('DD/MM/YYYY HH:mm')}</td>
                                <td>{engineer?engineer.username: '-'}</td>
                                <td>{dayjs(item.endDate).format('DD/MM/YYYY HH:mm')}</td>
                                <td>{dayjs(item.payDate).format('DD/MM/YYYY HH:mm')}</td>
                                <td>{item.status}</td>
                            </tr>
                            )
                        })}
                    </tbody> */}
                {/* <tbody>
                    {listReport.length > 0 && listReport.map((item, index) => {
                        const engineer = engineers.find(engineer => engineer.id === item.engineerId);

                        // If the status is 'done', we keep the existing endDate without modification
                        const endDate = item.status === 'done' && item.endDate ? item.endDate : dayjs().format('DD/MM/YYYY HH:mm');
                        const payDate = item.status === 'complete' && item.payDate ? item.payDate : dayjs().format('DD/MM/YYYY HH:mm');

                        return (
                            <tr key={index}>
                                <td>{item.deviceName}</td>
                                <td>{item.problem}</td>
                                <td>{item.solving}</td>
                                <td>{item.customerName}</td>
                                <td>{dayjs(item.createdAt).format('DD/MM/YYYY HH:mm')}</td>
                                <td>{engineer ? engineer.username : '-'}</td>
                                <td>{dayjs(endDate).format('DD/MM/YYYY HH:mm')}</td> 
                                <td>{dayjs(payDate).format('DD/MM/YYYY HH:mm')}</td>
                                <td>{item.status}</td>
                            </tr>
                        )
                    })}
                </tbody> */}
                <tbody>
                    {listReport.length > 0 && listReport.map((item, index) => {
                        const engineer = engineers.find(engineer => engineer.id === item.engineerId);

                        // Ensure that 'endDate' is preserved for 'done' status, otherwise use current time
                        const endDate = item.status === 'done' && item.endDate ? item.endDate : (item.status !== 'done' ? dayjs().format('DD/MM/YYYY HH:mm') : '-');

                        // Ensure that 'payDate' is preserved for 'complete' status, otherwise use current time
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
                                {/* <td>{endDate !== '-' ? dayjs(endDate).format('DD/MM/YYYY HH:mm') : '-'}</td> */}
                                <td>{payDate !== '-' ? dayjs(payDate).format('DD/MM/YYYY HH:mm') : '-'}</td>
                                
                                {/* <td>{item.status}</td> */}
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}