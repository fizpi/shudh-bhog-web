const bookingDetailsForm = document.getElementById('bookingDetailsForm');
const bookingAddressForm = document.getElementById('bookingAddressForm');
const stepsParent = document.getElementById('from-progress');
function moveNextToAddress() {
    bookingAddressForm.style.display = 'block';
    bookingDetailsForm.style.display = 'none';

    const stepChildren = stepsParent.querySelectorAll('.step');
    stepChildren[1].classList.add('active');
}
let finalData = {};
  // Form Validation
document.getElementById('bookingDetailsForm').addEventListener('submit', function (e) {
    e.preventDefault();

    // Reset all error states
    document.querySelectorAll('.form-group').forEach(group => {
        group.classList.remove('error');
    });

    let isValid = true;

    // Check required fields
    const requiredFields = this.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        if (!field.value.trim() || (field.type === 'checkbox' && !field.checked)) {
            const formGroup = field.closest('.form-group');
            if (formGroup) {
                formGroup.classList.add('error');
            }
            isValid = false;
        }
    });

    // Check if package is selected
    const packageSelected = document.querySelector('input[name="package"]:checked');
    if (!packageSelected) {
        alert('Please select a prasad package');
        isValid = false;
    }

    // Validate email
    const email = document.getElementById('email');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.value)) {
        email.closest('.form-group').classList.add('error');
        isValid = false;
    }

    // Validate phone
    const phone = document.getElementById('phone');
    const phoneRegex = /^[\d\s+\-()]+$/;
    if (!phoneRegex.test(phone.value) || phone.value.length < 10) {
        phone.closest('.form-group').classList.add('error');
        isValid = false;
    }

    if (isValid) {
        // Store form data in sessionStorage
        const formData = new FormData(this);
        const data = {};
        formData.forEach((value, key) => {
            data[key] = value;
        });
        finalData = {
            "action": "create_order",
            "full_name": data.name,
            "email_address": data.email,
            "phone_number": data.phone,
            "alternate_phone": data.altphone,
            "package_type": packageSelected.value,
            "package_price": packageSelected.getAttribute('data-price'),
        };
        // console.log(finalData);
        moveNextToAddress();
    } else {
        // Scroll to first error
        const firstError = document.querySelector('.form-group.error');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
});
  // Form Validation
document.getElementById('bookingAddressForm').addEventListener('submit', function (e) {
    e.preventDefault();

    // Reset all error states
    document.querySelectorAll('.form-group').forEach(group => {
        group.classList.remove('error');
    });

    let isValid = true;

    // Check required fields
    const requiredFields = this.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        if (!field.value.trim() || (field.type === 'checkbox' && !field.checked)) {
            const formGroup = field.closest('.form-group');
            if (formGroup) {
                formGroup.classList.add('error');
            }
            isValid = false;
        }
    });

    // Validate PIN code
    const pincode = document.getElementById('pincode');
    if (pincode.value.length !== 6 || !/^\d{6}$/.test(pincode.value)) {
        pincode.closest('.form-group').classList.add('error');
        isValid = false;
    }

    if (isValid) {
        // Show spinner
        document.getElementById('submitSpinner').style.display = 'inline-block';

        // Store form data in sessionStorage
        const formData = new FormData(this);
        const data = {};
        formData.forEach((value, key) => {
            data[key] = value;
        });
        finalData = {
            ...finalData,
            "address_line1": data.address1,
            "address_line2": data.address2,
            "landmark": data.landmark,
            "city": data.city,
            "state": data.state,
            "pin_code": data.pincode,
            "country": data.country,
            "special_instructions": data.instructions
        };
        const body = JSON.stringify(finalData);
        console.log(body);
        fetch('https://www.smartpaybill.com/chhatpujaAPI/create_order.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: body
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            // window.location.href = 'payment.html';
        })
        .catch(error => {
            console.error('Error:', error);
        })
    } else {
        // Scroll to first error
        const firstError = document.querySelector('.form-group.error');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
});
