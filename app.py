import os
from flask import Flask, render_template, request, jsonify
from flask_mail import Mail, Message
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# Mail configuration
app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587))
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_USERNAME')

mail = Mail(app)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/contact', methods=['POST'])
def contact():
    data = request.get_json()

    name    = data.get('name', '').strip()
    email   = data.get('email', '').strip()
    message = data.get('message', '').strip()

    # Server-side validation
    if not name or not email or not message:
        return jsonify({'success': False, 'error': 'All fields are required.'}), 400

    if '@' not in email or '.' not in email.split('@')[-1]:
        return jsonify({'success': False, 'error': 'Invalid email address.'}), 400

    if len(message) < 10:
        return jsonify({'success': False, 'error': 'Message is too short.'}), 400

    try:
        recipient = os.getenv('MAIL_RECIPIENT', os.getenv('MAIL_USERNAME'))

        msg = Message(
            subject=f'Portfolio Contact: {name}',
            recipients=[recipient],
            body=f"Name: {name}\nEmail: {email}\n\nMessage:\n{message}",
            reply_to=email
        )
        mail.send(msg)
        return jsonify({'success': True, 'message': 'Your message has been sent. I\'ll get back to you soon!'})

    except Exception as e:
        app.logger.error(f'Mail error: {e}')
        # Return success in dev mode even if mail isn't configured
        if app.debug:
            return jsonify({'success': True, 'message': '[Dev] Message received (mail not configured).'})
        return jsonify({'success': False, 'error': 'Failed to send message. Please try again later.'}), 500

if __name__ == '__main__':
    app.run(debug=True)
