// Load required libraries for PDF generation
const loadScript = (src) => {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Load external libraries
        await Promise.all([
            loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'),
            loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js')
        ]);

        // Photo upload preview
        const photoInput = document.getElementById('studentPhoto');
        const photoPreview = document.getElementById('photoPreview');
        
        photoInput.addEventListener('change', function(e) {
            if (e.target.files.length > 0) {
                const file = e.target.files[0];
                if (file.type.match('image.*')) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        photoPreview.src = e.target.result;
                        photoPreview.classList.remove('hidden');
                    };
                    reader.readAsDataURL(file);
                } else {
                    alert('Por favor seleccione un archivo de imagen válido.');
                    photoInput.value = '';
                }
            }
        });

        // Age calculation from birthdate
        const birthDateInput = document.getElementById('birthDate');
        const ageInput = document.getElementById('age');
        
        birthDateInput.addEventListener('change', function() {
            if (birthDateInput.value) {
                const birthDate = new Date(birthDateInput.value);
                const today = new Date();
                let age = today.getFullYear() - birthDate.getFullYear();
                const monthDiff = today.getMonth() - birthDate.getMonth();
                
                if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                }
                
                ageInput.value = age + ' años';
            }
        });

        // PDF Generation
        const generatePdfBtn = document.getElementById('generatePdf');
        const studentForm = document.getElementById('studentForm');
        
        generatePdfBtn.addEventListener('click', function() {
            // Validate required fields
            const requiredFields = studentForm.querySelectorAll('[required]');
            let isValid = true;
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    field.classList.add('border-red-500');
                    isValid = false;
                } else {
                    field.classList.remove('border-red-500');
                }
            });

            if (!isValid) {
                alert('Por favor complete todos los campos obligatorios marcados con *.');
                return;
            }

            // Validate CURP format (basic check)
            const curp = document.getElementById('curp').value;
            if (curp.length !== 18 || !/^[A-Z0-9]+$/.test(curp)) {
                alert('El CURP debe tener 18 caracteres alfanuméricos.');
                document.getElementById('curp').classList.add('border-red-500');
                return;
            }

            // Generate PDF
            generatePdfBtn.disabled = true;
            generatePdfBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Generando...';

            // Use html2canvas to capture form
            html2canvas(studentForm, {
                scale: 2,
                logging: false,
                useCORS: true,
                allowTaint: true
            }).then(canvas => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jspdf.jsPDF({
                    orientation: 'portrait',
                    unit: 'mm'
                });

                // Calculate PDF dimensions
                const imgWidth = 210; // A4 width in mm
                const imgHeight = canvas.height * imgWidth / canvas.width;
                
                // Add image to PDF
                pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
                
                // Save PDF
                const studentName = document.getElementById('fullName').value;
                pdf.save(`Ficha_Escolar_${studentName.replace(/\s+/g, '_')}.pdf`);
                
                generatePdfBtn.disabled = false;
                generatePdfBtn.innerHTML = '<i class="fas fa-file-pdf mr-2"></i> Generar PDF';
            }).catch(err => {
                console.error('Error generating PDF:', err);
                alert('Error al generar el PDF. Por favor intente nuevamente.');
                generatePdfBtn.disabled = false;
                generatePdfBtn.innerHTML = '<i class="fas fa-file-pdf mr-2"></i> Generar PDF';
            });
        });

    } catch (error) {
        console.error('Error loading scripts:', error);
        alert('Error al cargar las dependencias necesarias. Por favor recargue la página.');
    }
});