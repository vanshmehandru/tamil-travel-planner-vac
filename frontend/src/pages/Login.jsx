import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';

export function Login() {
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', age: '', gender: 'ஆண்' });
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    try {
      if (isLoginTab) {
        const res = await authAPI.login({ email: formData.email, password: formData.password });
        login(res.data.token, res.data.user);
        navigate('/home');
      } else {
        const res = await authAPI.register({
          username: formData.name, // Mapping 'name' to 'username'
          email: formData.email,
          password: formData.password,
          age: formData.age,
          gender: formData.gender
        });
        login(res.data.token, res.data.user);
        navigate('/home');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'பிழை ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-primary flex items-center justify-center p-6">
      <div className="card w-full max-w-[480px]">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">நம்ம யாத்திரை</h1>
          <p className="text-brandMutedText text-lg">உங்கள் பயணம், எங்கள் பொறுப்பு</p>
        </div>

        <div className="flex border-b mb-6">
          <button
            className={`flex-1 py-3 text-lg font-semibold border-b-4 transition-colors ${isLoginTab ? 'border-primary text-primary' : 'border-transparent text-brandMutedText hover:text-primary'}`}
            onClick={() => setIsLoginTab(true)}
          >
            உள்நுழை
          </button>
          <button
            className={`flex-1 py-3 text-lg font-semibold border-b-4 transition-colors ${!isLoginTab ? 'border-primary text-primary' : 'border-transparent text-brandMutedText hover:text-primary'}`}
            onClick={() => setIsLoginTab(false)}
          >
            பதிவு செய்
          </button>
        </div>

        {errorMsg && <div className="bg-red-100 border-l-4 border-brandRed text-brandRed p-4 mb-6 rounded">{errorMsg}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLoginTab && (
            <>
              <div>
                <label className="block text-brandDarkText mb-1 font-semibold">பெயர்</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required className="input-field" />
              </div>
              <div className="flex space-x-4">
                <div className="flex-1">
                  <label className="block text-brandDarkText mb-1 font-semibold">வயது</label>
                  <input type="number" name="age" value={formData.age} onChange={handleChange} required className="input-field" />
                </div>
                <div className="flex-1">
                  <label className="block text-brandDarkText mb-1 font-semibold">பாலினம்</label>
                  <select name="gender" value={formData.gender} onChange={handleChange} className="input-field">
                    <option value="ஆண்">ஆண்</option>
                    <option value="பெண்">பெண்</option>
                    <option value="மற்றவை">மற்றவை</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-brandDarkText mb-1 font-semibold">மின்னஞ்சல்</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required className="input-field" />
          </div>
          <div>
            <label className="block text-brandDarkText mb-1 font-semibold">கடவுச்சொல்</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required className="input-field" />
          </div>

          <button type="submit" disabled={isLoading} className="btn-primary w-full mt-6 text-xl">
            {isLoading ? 'தயாரிக்கிறோம்...' : isLoginTab ? 'உள்நுழை' : 'பதிவு செய்க'}
          </button>
        </form>

        <div className="text-center mt-6">
          <button onClick={() => setIsLoginTab(!isLoginTab)} className="text-primary hover:underline font-medium">
            {isLoginTab ? 'கணக்கு இல்லையா? பதிவு செய்யுங்கள்' : 'ஏற்கனவே கணக்கு உள்ளதா? உள்நுழையுங்கள்'}
          </button>
        </div>
      </div>
    </div>
  );
}
