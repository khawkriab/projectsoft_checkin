import { Box, Typography } from '@mui/material';

function PrivacyPolicy() {
    return (
        <Box>
            <Box sx={{ width: '100%', maxWidth: '900px', margin: 'auto' }}>
                <Typography variant='h4'>Privacy Policy</Typography>
                <p>
                    Projectsoft Checkin ("เรา") เคารพในความเป็นส่วนตัวของผู้ใช้งานทุกท่าน
                    และมุ่งมั่นในการปกป้องข้อมูลส่วนบุคคลของท่านตามหลักเกณฑ์กฎหมายที่เกี่ยวข้อง
                </p>
                <Typography variant='h5'>ข้อมูลที่เราเก็บรวบรวม</Typography>
                <p>
                    เราอาจเก็บข้อมูลต่อไปนี้จากผู้ใช้งาน:
                    <ul>
                        <li>ชื่อและนามสกุล</li>
                        <li>อีเมล</li>
                        <li>ข้อมูลบัญชี Google</li>
                        <li>ข้อมูลการใช้งานของผู้ใช้ (เช่น เวลาใช้งานและกิจกรรมภายในแอป)</li>
                    </ul>
                </p>
                <Typography variant='h5'>วัตถุประสงค์ของการใช้ข้อมูล</Typography>
                <p>
                    ข้อมูลที่เก็บรวบรวมจะถูกนำไปใช้เพื่อ:
                    <ul>
                        <li>ให้บริการและปรับปรุงแอป/เว็บไซต์</li>
                        <li>ติดต่อผู้ใช้งานในกรณีที่จำเป็น</li>
                        <li>วิเคราะห์และปรับปรุงประสบการณ์การใช้งาน</li>
                    </ul>
                </p>
                <Typography variant='h5'>การแบ่งปันข้อมูล</Typography>
                <p>
                    เรา จะไม่แบ่งปันหรือขายข้อมูลส่วนบุคคลของท่านให้กับบุคคลภายนอก ยกเว้นกรณีที่:
                    <ul>
                        <li>ได้รับความยินยอมจากท่าน</li>
                        <li>เป็นไปตามข้อกฎหมาย หรือคำสั่งศาล</li>
                    </ul>
                </p>
                <Typography variant='h5'>ความปลอดภัยของข้อมูล</Typography>
                <p>เราใช้มาตรการด้านความปลอดภัยทั้งทางเทคนิคและองค์กร เพื่อปกป้องข้อมูลส่วนบุคคลของท่านจากการเข้าถึงโดยไม่ได้รับอนุญาต</p>
                <Typography variant='h5'>สิทธิของผู้ใช้</Typography>
                <p>
                    ท่านมีสิทธิ:
                    <ul>
                        <li>เข้าถึง แก้ไข หรือลบข้อมูลส่วนบุคคลของท่าน</li>
                        <li>ถอนความยินยอมในการใช้ข้อมูลได้ทุกเมื่อ</li>
                    </ul>
                </p>
                <Typography variant='h5'>ติดต่อเรา</Typography>
                <p>
                    หากท่านมีคำถามเกี่ยวกับนโยบายความเป็นส่วนตัวนี้
                    <div>กรุณาติดต่อ: Sittisak Thainoi</div>
                    <div>อีเมล: khawkriab.dev@gmail.com</div>
                    <div>เว็บไซต์: https://khawkriab.github.io/projectsoft_checkin</div>
                </p>
            </Box>
        </Box>
    );
}

export default PrivacyPolicy;
