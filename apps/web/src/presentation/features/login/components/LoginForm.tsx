import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginFormSchema } from '@nx-starter/application-shared';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Card, CardContent } from '../../../components/ui/card';
import { Checkbox } from '../../../components/ui/checkbox';
import { User, Lock, LogIn } from 'lucide-react';
import { useLoginFormViewModel } from '../view-models/useLoginFormViewModel';
import type { LoginFormData } from '../types';

export const LoginForm: React.FC = () => {
  const viewModel = useLoginFormViewModel();
  
  // Get remembered credentials
  const rememberedCredentials = viewModel.getRememberedCredentials();
  
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isValid, isDirty },
    setFocus,
  } = useForm<LoginFormData>({
    resolver: zodResolver(LoginFormSchema),
    mode: 'onChange', // Enable real-time validation
    defaultValues: {
      identifier: rememberedCredentials?.identifier || '',
      password: '',
      rememberMe: rememberedCredentials?.rememberMe || false,
    },
  });
  
  // Watch form values directly for button state
  const identifier = watch('identifier');
  const password = watch('password');
  
  // Check if form is empty based on watched values
  const isFormEmpty = !identifier?.trim() || !password?.trim();

  // Set focus on appropriate field when component mounts
  useEffect(() => {
    if (rememberedCredentials?.identifier) {
      // If identifier is remembered, focus on password field
      setFocus('password');
    } else {
      // Otherwise focus on identifier field
      setFocus('identifier');
    }
  }, [setFocus, rememberedCredentials]);

  const onSubmit = handleSubmit(async (data: LoginFormData) => {
    const success = await viewModel.handleFormSubmit(data.identifier, data.password, data.rememberMe);
    if (success) {
      reset();
    }
  });

  // Handle keyboard events (Enter key)
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !viewModel.isSubmitting) {
      event.preventDefault();
      onSubmit();
    }
  };

  // Clear error when user starts typing
  const handleInputChange = () => {
    if (viewModel.error) {
      viewModel.clearError();
    }
  };

  return (
    <div className="w-full max-w-[400px] mx-auto">
      <Card className="bg-white shadow-xl border-0 rounded-[20px] shadow-[0_8px_20px_rgba(0,0,0,0.15)]">
        <CardContent className="p-8 pt-8">
          <h1 className="text-[28px] font-normal text-center mb-6 text-[#0b4f6c] font-[system-ui,Segoe_UI,Tahoma,Geneva,Verdana,sans-serif]">
            Login
          </h1>
          
          {/* Error message */}
          {viewModel.error && (
            <div 
              className="text-red-600 text-sm mb-4 text-center text-[crimson]"
              data-testid="login-error"
            >
              {viewModel.error}
            </div>
          )}

          <form onSubmit={onSubmit} onKeyDown={handleKeyDown}>
            {/* Username/Email Field */}
            <div className="relative mb-3">
              <div 
                className="flex items-center bg-[#f5f7fa] border border-[#ccc] rounded-[10px] overflow-hidden mt-[15px] h-[50px]"
              >
                <div className="pl-3 pr-2">
                  <User className="h-5 w-5 text-[#4db6ac]" />
                </div>
                <Input
                  {...register('identifier')}
                  type="text"
                  placeholder="Username or Email"
                  disabled={viewModel.isSubmitting}
                  onChange={(e) => {
                    // First call the register's onChange
                    register('identifier').onChange(e);
                    // Then call our custom handler
                    handleInputChange();
                  }}
                  className="bg-transparent h-full focus:bg-[#e6f4f1] text-[#333] placeholder-[#888] text-[15px] px-[15px] w-full box-border border-none outline-none shadow-none rounded-tl-none rounded-bl-none"
                  data-testid="login-identifier-input"
                  style={{ boxShadow: 'none' }}
                />
              </div>
              {errors.identifier && (
                <p
                  className="text-sm text-red-600 mt-1 px-3 text-[crimson]"
                  data-testid="login-identifier-error"
                >
                  {errors.identifier.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="relative mb-3">
              <div 
                className="flex items-center bg-[#f5f7fa] border border-[#ccc] rounded-[10px] overflow-hidden mt-[15px] h-[50px]"
              >
                <div className="pl-3 pr-2">
                  <Lock className="h-5 w-5 text-[#4db6ac]" />
                </div>
                <Input
                  {...register('password')}
                  type="password"
                  placeholder="Password"
                  disabled={viewModel.isSubmitting}
                  onChange={(e) => {
                    // First call the register's onChange
                    register('password').onChange(e);
                    // Then call our custom handler
                    handleInputChange();
                  }}
                  className="bg-transparent h-full focus:bg-[#e6f4f1] text-[#333] placeholder-[#888] text-[15px] px-[15px] w-full box-border border-none outline-none shadow-none rounded-tl-none rounded-bl-none"
                  data-testid="login-password-input"
                  style={{ boxShadow: 'none' }}
                />
              </div>
              {errors.password && (
                <p
                  className="text-sm text-red-600 mt-1 px-3 text-[crimson]"
                  data-testid="login-password-error"
                >
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center space-x-2 mt-4">
              <Checkbox
                checked={watch('rememberMe')}
                onCheckedChange={(checked) => setValue('rememberMe', !!checked)}
                id="rememberMe"
                disabled={viewModel.isSubmitting}
                className="data-[state=checked]:bg-[#4db6ac] data-[state=checked]:border-[#4db6ac]"
                data-testid="login-remember-me-checkbox"
              />
              <label
                htmlFor="rememberMe"
                className="text-sm text-gray-700 cursor-pointer select-none"
              >
                Remember Me
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isFormEmpty || viewModel.isSubmitting}
              className="w-full bg-[#4db6ac] hover:bg-[#3ba69c] active:bg-[#b2dfdb] active:text-[#004d40] text-white font-bold border-0 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 mt-4 h-[50px] rounded-[10px] text-[16px]"
              data-testid="login-submit-button"
            >
              <LogIn className="h-5 w-5 mr-2" />
              {viewModel.isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Login
                </>
              ) : (
                'Login'
              )}
            </Button>
          </form>

          {/* Additional Links (Placeholder for future features) */}
          <div className="mt-6 text-center space-y-2">
            <button
              type="button"
              className="text-[#4db6ac] hover:text-[#3ba69c] text-sm font-medium underline"
              onClick={() => {
                // TODO: Implement forgot password functionality
                console.log('Forgot password clicked');
              }}
              data-testid="forgot-password-link"
            >
              Forgot Password?
            </button>
            <div className="text-gray-600 text-sm">
              Don't have an account?{' '}
              <button
                type="button"
                className="text-[#4db6ac] hover:text-[#3ba69c] font-medium underline"
                onClick={() => {
                  // TODO: Implement navigation to register page
                  console.log('Create account clicked');
                }}
                data-testid="create-account-link"
              >
                Create Account
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};