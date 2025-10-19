const bookingDetailsForm = document.getElementById('bookingDetailsForm');
const bookingAddressForm = document.getElementById('bookingAddressForm');
const stepsParent = document.getElementById('from-progress');
const paymentContainer = document.getElementById('payment-container');
const paymentSuccess = document.getElementById('paymentSuccess');
function moveNextToAddress() {
    bookingAddressForm.style.display = 'block';
    bookingDetailsForm.style.display = 'none';

    const stepChildren = stepsParent.querySelectorAll('.step');
    stepChildren[1].classList.add('active');

    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
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
        // console.log(body);
        fetch('https://www.smartpaybill.com/chhatpujaAPI/create_order.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: body
        })
        .then(response => response.json())
        .then(data => {
            // console.log(data);
            if(data.success===true){
                proceedToPayment(data);
            }
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

function proceedToPayment(data){
    const orderData = data.data
    //  {
    //     order_id: "3",
    //     full_name: "Priya Sharma",
    //     email: "priya.sharma@example.com",
    //     phone: "9123456789",
    //     package_type: "Premium",
    //     package_price: "1299",
    //     upiid: "8100546430@okbizaxis"
    // };

    bookingAddressForm.style.display = 'none';
    bookingDetailsForm.style.display = 'none';
    paymentContainer.style.display = 'block';

    const stepChildren = stepsParent.querySelectorAll('.step');
    stepChildren[2].classList.add('active');

    // Update UI with order data
    document.getElementById('orderId').textContent = orderData.order_id;
    document.getElementById('customerName').textContent = orderData.full_name;
    document.getElementById('customerEmail').textContent = orderData.email;
    document.getElementById('customerPhone').textContent = orderData.phone;
    document.getElementById('packageType').textContent = orderData.package_type;
    document.getElementById('totalAmount').textContent = '₹' + orderData.package_price;
    document.getElementById('payAmount').textContent = orderData.package_price;
    document.getElementById('upiId').textContent = data.upiid;
    orderId = orderData.order_id;
    makeQR(data);

    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
    // Start countdown timer
    startTimer(20 * 60); // 15 minutes in seconds
}
let orderId =null;
function makeQR(data){
    const upiId = data.upiid;
    const amount = data.data.package_price;
    const name = data.data.full_name; // optional
    const note = "txn"+data.data.phone+data.data.order_id; // optional

    // UPI Payment URL format
    // const upiUrl = `upi://pay?pa=${upiId}&pn=${name}&am=${amount}&cu=INR&tn=${note}`;
    let upiUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(name)}&tn=${note}&cu=INR&am=${amount}`;
            
    // console.log(upiUrl)
    const qrcodeDiv = document.getElementById('qrPlaceholder');
    qrcodeDiv.innerHTML = '';
    
    // Generate new QR code
    qrcode = new QRCode(qrcodeDiv, {
        text: upiUrl,
        width: 256,
        height: 256,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
    });
}

 function startTimer(duration) {
    let timer = duration;
    const display = document.getElementById('timer');
    
    const interval = setInterval(() => {
        const minutes = Math.floor(timer / 60);
        const seconds = timer % 60;
        
        display.textContent = 
            (minutes < 10 ? '0' : '') + minutes + ':' + 
            (seconds < 10 ? '0' : '') + seconds;
        
        if (--timer < 0) {
            clearInterval(interval);
            display.textContent = 'Time Expired!';
            display.style.color = 'var(--error)';
            alert('Payment time expired. Please create a new order.');
            window.location.href = 'form';
        }
    }, 1000);
}

// Verify Payment
function verifyPayment() {
    const transactionId = document.getElementById('transactionId').value.trim();
    
    if (!transactionId) {
        alert('Please enter Transaction ID');
        return;
    }
    if (orderId==null) {
         alert('Please create an order first');
         return;
    }

   const body =  {
        "action": "update_payment",
        "order_id": orderId,
        "payment_status": "Completed",
        "payment_method": "UPI",
        "transaction_id": transactionId
    };

    fetch('https://www.smartpaybill.com/chhatpujaAPI/create_order.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
    })
    .then(response => response.json())
    .then(data => {
        // console.log(data);
        if(data.success===true){
            paymentSuccess.style.display = 'flex';
            paymentContainer.style.display = 'none';
            const stepChildren = stepsParent.querySelectorAll('.step');
            stepChildren[3].classList.add('active');
            document.getElementById('formTitle').style.display = 'none';
            document.getElementById('formSubtitle').style.display = 'none';
            paymentSuccess.innerHTML = `
            <h2 style="font-size: 50px;">✅</h2>
            <h2>We are Reviewing Your Order</h2>
                <p>Your order (Order ID - #`+ orderId +`) is under review. We'll get back to you soon!</p>
                    <br>
                <button class="btn btn-primary" onclick="window.location.href='./'">
                    Back to Home
                </button>
            `;

            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        } else {
            alert(data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    })
}