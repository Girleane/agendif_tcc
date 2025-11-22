
'use client';

import { useState } from 'react';
import LoginForm from '@/components/auth/login-form';
import SignUpForm from '@/components/auth/signup-form';
import { AgendIfLogo } from '@/components/icons';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const [isLoginView, setIsLoginView] = useState(true);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-2 sm:p-4">
      <Card className="w-full max-w-sm sm:max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <AgendIfLogo className="h-12 w-12 text-green-700" />
          </div>
          <CardTitle className="text-2xl font-headline">
            {isLoginView ? 'Bem-vindo de volta!' : 'Crie sua conta'}
          </CardTitle>
          <CardDescription>
            {isLoginView ? 'Faça login para continuar no AgendIF.' : 'Preencha os campos para se cadastrar.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoginView ? <LoginForm /> : <SignUpForm onSuccess={() => setIsLoginView(true)} />}
        </CardContent>
        <CardFooter className="flex-col">
          <p className="text-sm text-muted-foreground">
            {isLoginView ? 'Não tem uma conta?' : 'Já tem uma conta?'}
            <Button variant="link" onClick={() => setIsLoginView(!isLoginView)} className="pl-1">
              {isLoginView ? 'Cadastre-se' : 'Faça login'}
            </Button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
