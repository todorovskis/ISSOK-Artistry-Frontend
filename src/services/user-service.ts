import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Jwt } from "app/interfaces/jwt";
import { BehaviorSubject, Observable, catchError, map, throwError } from "rxjs";
import { JwtHelperService } from "@auth0/angular-jwt";
import { Router } from "@angular/router";

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    readonly baseUrl: string = "http://localhost:8080/api/auth"
    private isUserLoggedInSubject: BehaviorSubject<boolean>
    jwtHelperService = new JwtHelperService()

    constructor(private http: HttpClient,
        private router: Router
    ) {
        if (localStorage.getItem('jwt')) {
            this.isUserLoggedInSubject = new BehaviorSubject<boolean>(true)
        } else {
            this.isUserLoggedInSubject = new BehaviorSubject<boolean>(false)
        }
    }

    registerClient(formData: FormData): Observable<boolean> {
        return this.http.post<Jwt | undefined>(`${this.baseUrl}/client/register`, formData)
            .pipe(
                map(value => {
                    if (value && value.jwt) {
                        localStorage.setItem("jwt", value.jwt);
                        this.isUserLoggedInSubject.next(true);
                        return true;
                    } else {
                        return false;
                    }
                })
            )
    }

    registerArtist(formData: FormData
    ): Observable<boolean> {
        return this.http.post<Jwt | undefined>(`${this.baseUrl}/artist/register`, formData)
            .pipe(
                map(value => {
                    if (value && value.jwt) {
                        localStorage.setItem("jwt", value.jwt);
                        this.isUserLoggedInSubject.next(true);
                        return true;
                    } else {
                        return false;
                    }
                })
            )
    }

    login(username: string, password: string): Observable<boolean> {
        return this.http.post<Jwt | undefined>(`${this.baseUrl}/authenticate-user`, { username, password }).pipe(
            map(value => {
                if (value && value.jwt) {
                    localStorage.setItem("jwt", value.jwt);
                    this.isUserLoggedInSubject.next(true);
                    return true;
                } else {
                    return false;
                }
            }),
            catchError((err) => {
                return throwError(err);
            })
        );
    }

    getUsernameForUser(): string | undefined {
        const token = this.getToken()
        if (token) {
            const jwtHelperService = new JwtHelperService()
            const tokenPayload = jwtHelperService.decodeToken(token)
            return tokenPayload.username
        }
        return undefined;
    }
    
    getUserRole(): string | undefined{
        const token = this.getToken()
        if(token){
            const jwtHelperService = new JwtHelperService()
            const tokenPayload = jwtHelperService.decodeToken(token)
            console.log('token payload:' , tokenPayload)
            console.log(tokenPayload.role)
            return tokenPayload.role
        }
        return undefined
    }

    isUserLoggedIn(): Observable<boolean> {
        return this.isUserLoggedInSubject.asObservable()
    }

    isTokenExpired() {
        return this.getToken()
    }

    getToken(): string | null {
        return localStorage.getItem('jwt');
    }

    logout() {
        localStorage.removeItem('jwt')
        this.isUserLoggedInSubject.next(false)
        this.router.navigateByUrl('/') 
    }
}