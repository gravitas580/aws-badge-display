import React, { useState, useRef, ChangeEvent } from 'react';
import { 
    Button,
    Select,
    MenuItem, 
    // InputLabel, 
    TextField, 
    Card, 
    CardContent, 
    CardHeader, 
    Typography,
    SelectChangeEvent ,
    Grid
} from '@mui/material';
// 資格情報の定義
const AWS_CERTIFICATIONS = [
    { code: 'CLF', name: 'Cloud Practitioner', expectedFileName: 'aws-certified-cloud-practitioner.png' },
    { code: 'SAA', name: 'Solutions Architect Associate', expectedFileName: 'aws-certified-solutions-architect-associate.png' },
    { code: 'SAP', name: 'Solutions Architect Professional', expectedFileName: 'aws-certified-solutions-architect-professional.png' },
    { code: 'DVA', name: 'Developer Associate', expectedFileName: 'aws-certified-developer-associate.png' },
    { code: 'SOA', name: 'SysOps Administrator Associate', expectedFileName: 'aws-certified-sysops-administrator-associate.png' },
    { code: 'DAS', name: 'Data Analytics Specialty', expectedFileName: 'aws-certified-data-analytics-specialty.png' },
    { code: 'MLS', name: 'Machine Learning Specialty', expectedFileName: 'aws-certified-machine-learning-specialty.png' },
    { code: 'ANS', name: 'Advanced Networking Specialty', expectedFileName: 'aws-certified-advanced-networking-specialty.png' },
    { code: 'SCS', name: 'Security Specialty', expectedFileName: 'aws-certified-security-specialty.png' },
    { code: 'DOP', name: 'DevOps Engineer Professional', expectedFileName: 'aws-certified-devops-engineer-professional.png' },
    { code: 'DBS', name: 'DataBase Specialty', expectedFileName: 'aws-certified-database-specialty.png' },
    { code: 'DAS', name: 'Data Analytics Specialty', expectedFileName: 'aws-certified-data-analytics-specialty.png' },
    { code: 'DOP', name: 'SAP on AWS Professional', expectedFileName: 'aws-certified-sap-on-aws-speciality.png' },
    { code: 'DEA', name: 'Data Engineer Associate', expectedFileName: 'aws-certified-data-engineer-associate.png' },
    { code: 'MLA', name: 'Machine Learning Associate', expectedFileName: 'aws-certified-machine-learning-engineer-associate.png' },
    { code: 'AIF', name: 'AI Practitioner', expectedFileName: 'aws-certified-ai-practitioner.png' },
];

// バッジ情報のインターフェース
interface BadgeInfo {
    file: File;
    isOfficialBadge: boolean;
}

const AWSSertificationBadgeAligner: React.FC = () => {
    // アップロードされた画像の状態管理
    const [uploadedImages, setUploadedImages] = useState<{ [key: string]: BadgeInfo }>({});
    const [selectedBadges, setSelectedBadges] = useState<string[]>(Array(24).fill(''));
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 画像ファイルアップロードハンドラ
    const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) return;

        const newUploadedImages: { [key: string]: BadgeInfo } = {};
        
        Array.from(files).forEach(file => {
            // 各認定資格に対してファイル名をチェック
            const matchingCert = AWS_CERTIFICATIONS.find(cert => 
                file.name.toLowerCase() === cert.expectedFileName.toLowerCase()
            );

            if (matchingCert) {
                // 正規の資格バッジファイル
                newUploadedImages[matchingCert.code] = {
                    file,
                    isOfficialBadge: true
                };
            } else {
                // ユーザーがアップロードした画像で、資格名と一致する場合
                const userCert = AWS_CERTIFICATIONS.find(cert => 
                    file.name.toLowerCase().includes(cert.code.toLowerCase())
                );

                if (userCert) {
                    newUploadedImages[userCert.code] = {
                        file,
                        isOfficialBadge: false
                    };
                }
            }
        });

        setUploadedImages(prev => ({
            ...prev,
            ...newUploadedImages
        }));
    };

    const handleBadgeSelect = (index: number, value: string) => {
        // 選択された資格の画像がアップロードされているかチェック
        if (value === '' || uploadedImages[value]) {
            const newSelectedBadges = [...selectedBadges];
            newSelectedBadges[index] = value;
            setSelectedBadges(newSelectedBadges);
        } else {
            alert(`${value}の資格画像をアップロードしてください`);
        }
    };

    // 画像生成ハンドラ
    const generateBadgeImage = () => {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // バッジの設定
        const badgeEdge = 200;  // バッジのサイズ
        const margin = 20;     // バッジ間の余白

        // キャンバスのサイズ設定
        canvas.width = 1500;
        canvas.height = 800;
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 座標計算
        const positions = getPositions(4, 6, badgeEdge, margin);

        // 画像の読み込みと配置
        const imagesToPlace = selectedBadges.filter(code => code !== '');
        
        imagesToPlace.forEach((code, index) => {
            if (uploadedImages[code] && positions[index]) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = new Image();
                    img.onload = () => {
                        ctx.drawImage(
                            img, 
                            positions[index].w, 
                            positions[index].h, 
                            badgeEdge, 
                            badgeEdge
                        );
                        
                        // 最後の画像の描画が完了したら画像を生成
                        if (index === imagesToPlace.length - 1) {
                            setGeneratedImage(canvas.toDataURL());
                        }
                    };
                    img.src = e.target?.result as string;
                };
                reader.readAsDataURL(uploadedImages[code].file);
            }
        });
    };

    // 座標計算関数（以前のコードと同じ）
    function getPositions(
        nrows: number, 
        ncols: number, 
        badgeEdge: number, 
        margin: number = 0
    ): Point2D[] {
        const positions: Point2D[] = [];

        for (let rowNo = 0; rowNo < nrows; rowNo++) {
            for (let colNo = 0; colNo < ncols; colNo++) {
                let ph: number, pw: number;

                if (rowNo % 2 === 0) {
                    ph = Math.floor(3 / 2 * (badgeEdge + margin) * rowNo / 2);
                    pw = Math.floor((badgeEdge + margin) * colNo);
                } else {
                    ph = Math.floor(
                        3 / 4 * (badgeEdge + margin) + 
                        3 / 2 * (badgeEdge + margin) * (rowNo - 1) / 2
                    );
                    pw = Math.floor(
                        1 / 2 * (badgeEdge + margin) + 
                        (badgeEdge + margin) * colNo
                    );
                }

                positions.push({ h: ph, w: pw });
            }
        }

        return positions;
    }

    // 利用可能な資格の計算
    const availableCertifications = Object.keys(uploadedImages);

    return (
        <Card sx={{ width: '100%', maxWidth: 1200, margin: 'auto' }}>
            <CardHeader title="AWS認定バッジ アライナー" />
            <CardContent>
                <TextField
                    fullWidth
                    type="file"
                    inputProps={{ 
                        multiple: true, 
                        accept: '.png' 
                    }}
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    sx={{ mb: 2 }}
                    label="AWS認定バッジ画像をアップロード"
                    InputLabelProps={{ shrink: true }}
                />

                <Grid container spacing={2}>
                    {[...Array(24)].map((_, index) => (
                        <Grid item xs={2} key={index}>
                            <Select
                                fullWidth
                                value={selectedBadges[index]}
                                onChange={(e: SelectChangeEvent<string>) => 
                                    handleBadgeSelect(index, e.target.value)
                                }
                                displayEmpty
                            >
                                <MenuItem value="" disabled>
                                    選択
                                </MenuItem>
                                {availableCertifications.map(code => {
                                    const cert = AWS_CERTIFICATIONS.find(c => c.code === code);
                                    const badgeInfo = uploadedImages[code];
                                    return (
                                        <MenuItem key={code} value={code}>
                                            {code} - {cert?.name}
                                            {!badgeInfo.isOfficialBadge && " (ユーザーアップロード)"}
                                        </MenuItem>
                                );
                                })}
                            </Select>
                        </Grid>
                    ))}
                </Grid>

                <Button 
                    fullWidth
                    variant="contained" 
                    color="primary" 
                    onClick={generateBadgeImage}
                    disabled={selectedBadges.filter(badge => badge !== '').length === 0}
                    sx={{ mt: 2, mb: 2 }}
                >
                    バッジ画像を生成
                </Button>

                {generatedImage && (
                    <Card sx={{ mt: 2 }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2 }}>
                                生成されたバッジ
                            </Typography>
                            <img 
                                src={generatedImage} 
                                alt="Generated Badge" 
                                style={{ maxWidth: '100%', height: 'auto' }}
                            />
                        </CardContent>
                    </Card>
                )}

                <canvas 
                    ref={canvasRef} 
                    style={{ display: 'none' }}
                />
            </CardContent>
        </Card>
    );
};

export default AWSSertificationBadgeAligner;

// Point2D型の定義
interface Point2D {
    readonly h: number;
    readonly w: number;
}