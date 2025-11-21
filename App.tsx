import React, { useState } from 'react';
import { ParticlesBackground } from './components/ParticlesBackground';
import { Input } from './components/Input';
import { RegistrationData } from './types';
import { generateWelcomeMessage } from './services/geminiService';
import { Upload, CheckCircle, FileText, Loader2, Ticket, FileSignature, User, Phone, PenTool } from 'lucide-react';

const App: React.FC = () => {
  const [formData, setFormData] = useState<RegistrationData>({
    directorName: '',
    playwrightName: '',
    directorPhone: '',
    playTitle: '',
    scriptFile: null,
    isDirectorPlaywright: true, // Default to yes
    authorPermissionFile: null,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof RegistrationData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [aiMessage, setAiMessage] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof RegistrationData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleRadioChange = (isDirector: boolean) => {
    setFormData((prev) => ({ 
      ...prev, 
      isDirectorPlaywright: isDirector,
      // If switching to YES, clear the permission file error if it exists
      authorPermissionFile: isDirector ? null : prev.authorPermissionFile 
    }));
    
    if (isDirector) {
       setErrors(prev => ({ ...prev, authorPermissionFile: undefined }));
    }
  };

  const handleScriptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file && file.type !== 'application/pdf') {
      setErrors((prev) => ({ ...prev, scriptFile: 'لطفا فقط فایل PDF بارگذاری کنید.' }));
      return;
    }
    setFormData((prev) => ({ ...prev, scriptFile: file }));
    setErrors((prev) => ({ ...prev, scriptFile: undefined }));
  };

  const handlePermissionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file && !['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      setErrors((prev) => ({ ...prev, authorPermissionFile: 'لطفا فایل PDF یا تصویر (JPG/PNG) معتبر بارگذاری کنید.' }));
      return;
    }
    setFormData((prev) => ({ ...prev, authorPermissionFile: file }));
    setErrors((prev) => ({ ...prev, authorPermissionFile: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation Logic
    const newErrors: Partial<Record<keyof RegistrationData, string>> = {};
    
    if (!formData.directorName.trim()) newErrors.directorName = 'نام کارگردان الزامی است.';
    if (!formData.playwrightName.trim()) newErrors.playwrightName = 'نام نویسنده الزامی است.';
    if (!formData.directorPhone.trim()) newErrors.directorPhone = 'شماره همراه کارگردان الزامی است.';
    if (!formData.playTitle.trim()) newErrors.playTitle = 'نام اثر الزامی است.';
    if (!formData.scriptFile) newErrors.scriptFile = 'بارگذاری فایل نمایشنامه الزامی است.';
    
    // Conditional Validation
    if (!formData.isDirectorPlaywright && !formData.authorPermissionFile) {
      newErrors.authorPermissionFile = 'چون کارگردان و نویسنده یکی نیستند، بارگذاری مجوز الزامی است.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Call Gemini for a creative receipt message
      const message = await generateWelcomeMessage(formData.directorName, formData.playTitle);
      
      setAiMessage(message);
      setIsSuccess(true);
    } catch (error) {
      console.error("Submission failed", error);
      alert("خطایی رخ داد. لطفا مجددا تلاش کنید.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({ 
      directorName: '', 
      playwrightName: '', 
      directorPhone: '', 
      playTitle: '', 
      scriptFile: null, 
      isDirectorPlaywright: true,
      authorPermissionFile: null 
    });
    setIsSuccess(false);
    setAiMessage('');
    setErrors({});
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden font-sans text-[#f3f4f6]">
      <ParticlesBackground />

      <div className="relative z-10 w-full max-w-xl">
        {!isSuccess ? (
          <div className="bg-[#001a1f]/80 backdrop-blur-xl border border-[#098a9b]/30 rounded-2xl shadow-2xl overflow-hidden transform transition-all animate-entrance">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#016876] to-[#098a9b] p-6 text-center relative overflow-hidden border-b border-[#098a9b]/50">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center border border-white/20 backdrop-blur-sm shadow-[0_0_20px_rgba(9,138,155,0.4)]">
                 <Ticket className="w-8 h-8 text-[#ffee36]" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2 font-vazir">نهمین جشنواره تئاتر کوتاه</h1>
              <p className="text-cyan-100/80 text-sm font-light">فرم ثبت نام و ارسال آثار</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5">
              
              {/* Director Name */}
              <div className="relative">
                <div className="absolute left-3 top-[42px] pointer-events-none text-[#098a9b]">
                  <User className="w-5 h-5" />
                </div>
                <Input
                  label="نام و نام خانوادگی کارگردان"
                  name="directorName"
                  placeholder="مثال: بهرام بیضایی"
                  value={formData.directorName}
                  onChange={handleInputChange}
                  error={errors.directorName}
                  className="pl-10"
                />
              </div>

              {/* Playwright Name */}
              <div className="relative">
                <div className="absolute left-3 top-[42px] pointer-events-none text-[#098a9b]">
                  <PenTool className="w-5 h-5" />
                </div>
                <Input
                  label="نام و نام خانوادگی نویسنده"
                  name="playwrightName"
                  placeholder="مثال: اکبر رادی"
                  value={formData.playwrightName}
                  onChange={handleInputChange}
                  error={errors.playwrightName}
                  className="pl-10"
                />
              </div>

              {/* Director Phone */}
              <div className="relative">
                <div className="absolute left-3 top-[42px] pointer-events-none text-[#098a9b]">
                  <Phone className="w-5 h-5" />
                </div>
                <Input
                  label="شماره تلفن همراه کارگردان"
                  name="directorPhone"
                  placeholder="0912..."
                  type="tel"
                  dir="ltr"
                  className="text-right pl-10 font-mono text-lg"
                  value={formData.directorPhone}
                  onChange={handleInputChange}
                  error={errors.directorPhone}
                />
              </div>

              <hr className="border-white/10 my-2" />

              {/* Play Title */}
              <Input
                label="نام اثر (نمایشنامه)"
                name="playTitle"
                placeholder="مثال: مرگ یزدگرد"
                value={formData.playTitle}
                onChange={handleInputChange}
                error={errors.playTitle}
              />

              {/* Script File Upload */}
              <div className="flex flex-col gap-2">
                <label className="text-gray-300 text-sm font-medium mr-1 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#ffee36]" />
                  فایل نمایشنامه (PDF)
                </label>
                <div className={`relative group border-2 border-dashed rounded-xl p-6 transition-all duration-200 text-center
                  ${errors.scriptFile ? 'border-red-500 bg-red-500/5' : 'border-neutral-700 hover:border-[#ffee36]/50 hover:bg-[#016876]/10'}`}>
                  
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleScriptChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                  />
                  
                  <div className="flex flex-col items-center justify-center gap-3 relative z-10 pointer-events-none">
                    {formData.scriptFile ? (
                      <>
                        <div className="w-12 h-12 rounded-full bg-[#098a9b]/20 flex items-center justify-center shadow-lg shadow-[#098a9b]/20">
                          <FileText className="w-6 h-6 text-[#ffee36]" />
                        </div>
                        <div className="text-sm text-[#ffee36] font-medium truncate max-w-[200px]">
                          {formData.scriptFile.name}
                        </div>
                        <p className="text-xs text-neutral-400">برای تغییر فایل کلیک کنید</p>
                      </>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Upload className="w-6 h-6 text-neutral-400 group-hover:text-[#ffee36] transition-colors" />
                        </div>
                        <p className="text-sm text-neutral-400 group-hover:text-white transition-colors">
                          انتخاب فایل نمایشنامه
                        </p>
                      </>
                    )}
                  </div>
                </div>
                {errors.scriptFile && <span className="text-red-400 text-xs mr-1">{errors.scriptFile}</span>}
              </div>

              {/* Conditional Logic Section */}
              <div className="bg-neutral-800/30 rounded-xl p-4 border border-white/5">
                <label className="text-white text-sm font-medium mb-4 block">
                  آیا کارگردان اثر، نویسنده این اثر نیز هست؟
                </label>
                
                <div className="flex gap-4 mb-4">
                  <button
                    type="button"
                    onClick={() => handleRadioChange(true)}
                    className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 border ${
                      formData.isDirectorPlaywright
                        ? 'bg-[#016876] border-[#ffee36] text-white shadow-[0_0_10px_rgba(1,104,118,0.3)]'
                        : 'bg-neutral-800 border-transparent text-neutral-400 hover:bg-neutral-700'
                    }`}
                  >
                    بله، یکی هستند
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRadioChange(false)}
                    className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 border ${
                      !formData.isDirectorPlaywright
                        ? 'bg-[#016876] border-[#ffee36] text-white shadow-[0_0_10px_rgba(1,104,118,0.3)]'
                        : 'bg-neutral-800 border-transparent text-neutral-400 hover:bg-neutral-700'
                    }`}
                  >
                    خیر
                  </button>
                </div>

                {/* Conditional Author Permission Upload */}
                {!formData.isDirectorPlaywright && (
                  <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                     <div className="flex flex-col gap-2 mt-4">
                      <label className="text-gray-300 text-sm font-medium mr-1 flex items-center gap-2">
                        <FileSignature className="w-4 h-4 text-[#ffee36]" />
                        تصویر مجوز نویسنده
                        <span className="text-xs text-[#ffee36] font-normal">(الزامی)</span>
                      </label>
                      <div className={`relative group border-2 border-dashed rounded-xl p-6 transition-all duration-200 text-center
                        ${errors.authorPermissionFile ? 'border-red-500 bg-red-500/5' : 'border-neutral-700 hover:border-[#ffee36]/50 hover:bg-[#016876]/10'}`}>
                        
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={handlePermissionChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                        />
                        
                        <div className="flex flex-col items-center justify-center gap-3 relative z-10 pointer-events-none">
                          {formData.authorPermissionFile ? (
                            <>
                              <div className="w-12 h-12 rounded-full bg-[#098a9b]/20 flex items-center justify-center">
                                <FileSignature className="w-6 h-6 text-[#ffee36]" />
                              </div>
                              <div className="text-sm text-[#ffee36] font-medium truncate max-w-[200px]">
                                {formData.authorPermissionFile.name}
                              </div>
                              <p className="text-xs text-neutral-400">برای تغییر فایل کلیک کنید</p>
                            </>
                          ) : (
                            <>
                              <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Upload className="w-6 h-6 text-neutral-400 group-hover:text-[#ffee36] transition-colors" />
                              </div>
                              <p className="text-sm text-neutral-400">
                                فایل مجوز را انتخاب کنید (PDF/JPG)
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                      {errors.authorPermissionFile && <span className="text-red-400 text-xs mr-1">{errors.authorPermissionFile}</span>}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-6 bg-gradient-to-r from-[#016876] via-[#098a9b] to-[#016876] bg-[length:200%_auto] hover:bg-right text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(9,138,155,0.4)] transform active:scale-[0.98] transition-all duration-500 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    در حال بررسی و ارسال...
                  </>
                ) : (
                  <>
                    <span>ثبت نام نهایی در جشنواره</span>
                    <CheckCircle className="w-5 h-5 text-[#ffee36]" />
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-[#001a1f]/90 backdrop-blur-xl border border-[#ffee36]/30 rounded-2xl shadow-2xl p-8 text-center animate-in fade-in zoom-in duration-300 max-w-lg mx-auto relative">
            <div className="w-24 h-24 mx-auto bg-gradient-to-tr from-[#016876]/20 to-[#098a9b]/10 rounded-full flex items-center justify-center mb-6 ring-1 ring-[#ffee36]/50 shadow-[0_0_30px_rgba(255,238,54,0.1)]">
              <CheckCircle className="w-12 h-12 text-[#ffee36]" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">ثبت نام موفق!</h2>
            <p className="text-neutral-400 mb-8 leading-relaxed">
              اطلاعات اثر <span className="text-[#ffee36] font-medium">"{formData.playTitle}"</span> با موفقیت در دبیرخانه نهمین جشنواره تئاتر کوتاه ثبت شد.
            </p>
            
            {/* AI Message Box */}
            {aiMessage && (
              <div className="bg-gradient-to-br from-[#002e36] to-[#001a1f] border border-[#ffee36]/30 rounded-xl p-6 mb-8 text-right relative shadow-inner">
                <div className="flex items-center gap-2 mb-3 border-b border-white/5 pb-2">
                  <div className="w-2 h-2 rounded-full bg-[#ffee36] animate-pulse"></div>
                  <span className="text-xs text-[#ffee36] font-bold uppercase tracking-wider">پیام دبیرخانه</span>
                </div>
                <p className="text-[#ffee36]/90 italic text-lg font-light leading-loose font-serif">
                  "{aiMessage}"
                </p>
              </div>
            )}

            <button
              onClick={resetForm}
              className="w-full py-3 rounded-lg border border-neutral-700 text-neutral-400 hover:text-[#ffee36] hover:bg-neutral-800 hover:border-[#ffee36]/50 transition-all"
            >
              بازگشت به صفحه اصلی
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-neutral-500 text-xs font-light tracking-wider">
            دبیرخانه نهمین جشنواره تئاتر کوتاه © ۱۴۰۴
          </p>
        </div>
      </div>
    </div>
  );
};

export default App;